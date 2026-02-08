import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

export type ClinicSession = {
  clinicId: string;
  name: string;
  email: string;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Yeni isim (benim kullandığım)
 */
export async function createClinicSessionToken(payload: ClinicSession): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({
    clinicId: payload.clinicId,
    name: payload.name,
    email: payload.email,
    typ: "clinic",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return token;
}

/**
 * ✅ GERİYE UYUMLULUK:
 * Projede login route 'signClinicSession' import ediyor.
 * O yüzden aynı fonksiyonu alias olarak export ediyoruz.
 */
export async function signClinicSession(payload: ClinicSession): Promise<string> {
  return createClinicSessionToken(payload);
}

/**
 * ✅ KRİTİK: JWT geçerli olsa bile clinic DB'de yoksa NULL döndürür.
 * (DB reset sonrası eski cookie'ler sistemi bozmasın)
 */
export async function verifyClinicSession(token: string): Promise<ClinicSession | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    const clinicId = typeof payload.clinicId === "string" ? payload.clinicId : "";
    if (!clinicId) return null;

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!clinic) return null;
    if (!clinic.isActive) return null;

    return { clinicId: clinic.id, name: clinic.name, email: clinic.email };
  } catch {
    return null;
  }
}
