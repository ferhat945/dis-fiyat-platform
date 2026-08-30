import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/*
 * Bu endpoint eski tekil lead API'sidir.
 *
 * Lead marketplace sistemiyle birlikte devre dışı bırakılmıştır.
 *
 * Lead detayları artık:
 * /panel/leadler/[id]
 *
 * server component'i üzerinden yetki kontrolü yapılarak hazırlanır.
 *
 * Böylece kilitli veya eski assignment kayıtları üzerinden
 * ham hasta iletişim bilgilerinin JSON olarak açığa çıkması engellenir.
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
          "Bu endpoint artık kullanılmıyor. Lead detayları klinik panelinden görüntülenmelidir.",
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
      "PANEL_LEAD_DISABLED_ENDPOINT_ERROR:",
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