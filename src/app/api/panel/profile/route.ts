import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeInstagramUrl(input: string): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  let v = raw;

  if (!v.includes("http") && !v.includes("instagram.com")) {
    v = v.replace(/^@+/, "").trim();
    v = v.replace(/^\/+|\/+$/g, "");
    if (!v) return null;
    return `https://www.instagram.com/${v}/`;
  }

  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;

  try {
    const u = new URL(v);
    const host = u.hostname.toLowerCase();

    const okHost =
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host.endsWith(".instagram.com");

    if (!okHost) return null;

    const out = `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "") + "/";
    return out.slice(0, 255);
  } catch {
    return null;
  }
}

const PatchSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200).optional(),
    currentPassword: z.string().max(200).optional(),
    phone: z
      .string()
      .max(40)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v.trim() : null)),
    instagramUrl: z
      .string()
      .max(255)
      .optional()
      .or(z.literal(""))
      .transform((v) => normalizeInstagramUrl(v ?? "")),
  })
  .transform((v) => ({
    name: v.name.trim(),
    email: v.email ? v.email.toLowerCase().trim() : undefined,
    currentPassword: v.currentPassword ?? "",
    phone: v.phone,
    instagramUrl: v.instagramUrl,
  }));

type PatchInput = z.infer<typeof PatchSchema>;

type OkClinic = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED_CLINIC" },
        { status: 401 },
      );
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        instagramUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { ok: false, code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ok: true, clinic: clinic as OkClinic },
      { status: 200 },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED_CLINIC" },
        { status: 401 },
      );
    }

    const json: unknown = await req.json();
    const data: PatchInput = PatchSchema.parse(json);

    const currentClinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!currentClinic) {
      return NextResponse.json(
        { ok: false, code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const currentEmail = currentClinic.email.toLowerCase().trim();
    const requestedEmail = data.email ?? currentEmail;
    const emailChanged = requestedEmail !== currentEmail;

    if (emailChanged) {
      if (data.currentPassword.trim().length < 6) {
        return NextResponse.json(
          { ok: false, code: "PASSWORD_REQUIRED" },
          { status: 400 },
        );
      }

      const passwordOk = await bcrypt.compare(
        data.currentPassword,
        currentClinic.passwordHash,
      );

      if (!passwordOk) {
        return NextResponse.json(
          { ok: false, code: "WRONG_PASSWORD" },
          { status: 400 },
        );
      }

      const existingEmail = await prisma.clinic.findUnique({
        where: { email: requestedEmail },
        select: { id: true },
      });

      if (existingEmail && existingEmail.id !== currentClinic.id) {
        return NextResponse.json(
          { ok: false, code: "EMAIL_ALREADY_EXISTS" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.clinic.update({
      where: { id: session.clinicId },
      data: {
        name: data.name,
        email: requestedEmail,
        phone: data.phone,
        instagramUrl: data.instagramUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        instagramUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { ok: true, clinic: updated as OkClinic },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          issues: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, code: "EMAIL_ALREADY_EXISTS" },
        { status: 409 },
      );
    }

    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
