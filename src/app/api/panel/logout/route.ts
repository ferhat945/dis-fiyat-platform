import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  const res = NextResponse.redirect(new URL("/panel/login", req.url));
  res.cookies.set("clinic_session", "", { path: "/", maxAge: 0 });
  return res;
}
