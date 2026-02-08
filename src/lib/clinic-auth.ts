import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyClinicSession } from "@/lib/auth";

export type ClinicSession = {
  clinicId: string;
  name: string;
  email: string;
};

export async function requireClinic(): Promise<ClinicSession> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) redirect("/panel/login");

  return session;
}
