import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/*
 * Bu endpoint eski lead liste API'sidir.
 *
 * Lead marketplace sistemiyle birlikte devre dışı bırakılmıştır.
 *
 * Lead listesi artık server-side panel sayfasından hazırlanır.
 * Böylece kilitli marketplace lead'lerinin ham iletişim
 * bilgilerinin JSON API üzerinden açığa çıkması engellenir.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const token =
      (await cookies()).get("clinic_session")?.value ?? "";

    const session = token
      ? await verifyClinicSession(token)
      : null;

    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          code: "UNAUTHORIZED_CLINIC",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        code: "ENDPOINT_DISABLED",
        message:
          "Bu endpoint artık kullanılmıyor. Lead verileri klinik panelinden görüntülenmelidir.",
      },
      {
        status: 410,
      }
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "UNKNOWN";

    console.error(
      "PANEL_LEADS_DISABLED_ENDPOINT_ERROR:",
      err
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        detail: msg,
      },
      {
        status: 500,
      }
    );
  }
}