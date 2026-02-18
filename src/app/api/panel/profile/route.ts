import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeInstagramUrl(input: string): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  // "kliniginiz" veya "@kliniginiz" veya "instagram.com/kliniginiz" gibi girişleri normalize et
  let v = raw;

  // sadece kullanıcı adı girildiyse
  if (!v.includes("http") && !v.includes("instagram.com")) {
    v = v.replace(/^@+/, "").trim();
    v = v.replace(/^\/+|\/+$/g, "");
    if (!v) return null;
    return `https://www.instagram.com/${v}/`;
  }

  // URL girildiyse
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    const host = u.hostname.toLowerCase();

    // instagram host kontrolü
    const okHost =
      host === "instagram.com" ||
      host === "www.instagram.com" ||
      host.endsWith(".instagram.com");

    if (!okHost) return null;

    // path içinden username çıkar (reels/p/... gibi şeyleri engellemeden sadece temizle)
    // Kullanıcı "https://instagram.com/kliniginiz" gibi girdiyse aynen kalsın.
    // Sonda slash olsun
    const out = `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "") + "/";
    return out.slice(0, 255);
  } catch {
    return null;
  }
}

const PatchSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z
    .string()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  instagramUrl: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((v) => normalizeInstagramUrl(v ?? "")),
});

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
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
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
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, clinic: clinic as OkClinic }, { status: 200 });
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
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const json: unknown = await req.json();
    const data: PatchInput = PatchSchema.parse(json);

    const updated = await prisma.clinic.update({
      where: { id: session.clinicId },
      data: {
        name: data.name.trim(),
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

    return NextResponse.json({ ok: true, clinic: updated as OkClinic }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
