import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const expected = (process.env.ADMIN_KEY ?? "").trim();
  const got = (req.headers.get("x-admin-key") ?? "").trim();

  return NextResponse.json(
    {
      ok: true,
      expectedLen: expected.length,
      gotLen: got.length,
      got,
      match: expected.length > 0 && got === expected,
      allHeaderKeys: Array.from(req.headers.keys()),
    },
    { status: 200 }
  );
}
