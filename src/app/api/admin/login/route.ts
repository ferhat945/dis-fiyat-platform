import { NextResponse } from "next/server";
import { z } from "zod";

const LoginSchema = z.object({
  key: z.string().min(1),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const expected = process.env.ADMIN_KEY;
    if (!expected || data.key !== expected) {
      return NextResponse.json(
        { ok: false, code: "WRONG_ADMIN_KEY" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }
}
