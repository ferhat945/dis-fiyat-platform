import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  currentPassword: z.string().min(6).max(200),
  newPassword: z.string().min(8).max(200),
});

type PatchInput = z.infer<typeof PatchSchema>;

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const json: unknown = await req.json();
    const data: PatchInput = PatchSchema.parse(json);

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: { id: true, passwordHash: true },
    });

    if (!clinic) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const ok = await bcrypt.compare(data.currentPassword, clinic.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, code: "WRONG_PASSWORD" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.clinic.update({
      where: { id: clinic.id },
      data: { passwordHash: newHash },
      select: { id: true },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
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
