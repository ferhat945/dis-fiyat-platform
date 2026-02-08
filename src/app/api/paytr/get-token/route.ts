import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

type PackageCode = "base" | "extra";

const BodySchema = z.object({
  package: z.enum(["base", "extra"]),
});

type Body = z.infer<typeof BodySchema>;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) throw new Error(`MISSING_ENV_${name}`);
  return v.trim();
}

function base64Basket(pkg: PackageCode): string {
  const basket: [string, string, number][] =
    pkg === "base"
      ? [["Başlangıç Paketi (10 Lead)", "800.00", 1]]
      : [["Ek Lead Paketi (+10 Lead)", "600.00", 1]];

  const json = JSON.stringify(basket);
  return Buffer.from(json, "utf-8").toString("base64");
}

function packageAmountKurus(pkg: PackageCode): number {
  return pkg === "base" ? 80000 : 60000;
}

function getClientIp(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "127.0.0.1";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;
    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
    }

    const json: unknown = await req.json();
    const body: Body = BodySchema.parse(json);
    const pkg: PackageCode = body.package;

    const merchant_id = requireEnv("PAYTR_MERCHANT_ID");
    const merchant_key = requireEnv("PAYTR_MERCHANT_KEY");
    const merchant_salt = requireEnv("PAYTR_MERCHANT_SALT");
    const baseUrl = requireEnv("APP_BASE_URL");

    const test_mode = process.env.PAYTR_TEST_MODE?.trim() === "1" ? "1" : "0";
    const currency = "TL";
    const no_installment = "0";
    const max_installment = "0";
    const debug_on = "1";
    const timeout_limit = "30";
    const lang = "tr";

    // PayTR: local testte user_ip için dış IP istenebilir. :contentReference[oaicite:6]{index=6}
    const user_ip = getClientIp(new Headers(req.headers));

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: { email: true, phone: true, name: true },
    });

    const email = clinic?.email ?? "no-reply@example.com";
    const user_name = clinic?.name ?? session.name;
    const user_address = "Türkiye";
    const user_phone = clinic?.phone ?? "0000000000";

    const payment_amount = packageAmountKurus(pkg);
    const user_basket = base64Basket(pkg);

    // merchant_oid içine clinicId + paket kodu gömüyoruz (callback'te bunu okuyacağız)
    const merchant_oid = `DFP-${session.clinicId}-${pkg}-${Date.now()}`;

    const merchant_ok_url = `${baseUrl}/panel/abonelik/sonuc?status=success`;
    const merchant_fail_url = `${baseUrl}/panel/abonelik/sonuc?status=fail`;

    // HASH: PayTR dokümanındaki Node örneği ile birebir :contentReference[oaicite:7]{index=7}
    const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token_str = `${hashSTR}${merchant_salt}`;
    const paytr_token = crypto.createHmac("sha256", merchant_key).update(paytr_token_str).digest("base64");

    // PayTR token endpoint: application/x-www-form-urlencoded :contentReference[oaicite:8]{index=8}
    const form = new URLSearchParams();
    form.set("merchant_id", merchant_id);
    form.set("email", email);
    form.set("payment_amount", String(payment_amount));
    form.set("merchant_oid", merchant_oid);
    form.set("user_name", user_name);
    form.set("user_address", user_address);
    form.set("user_phone", user_phone);
    form.set("merchant_ok_url", merchant_ok_url);
    form.set("merchant_fail_url", merchant_fail_url);
    form.set("user_basket", user_basket);
    form.set("user_ip", user_ip);
    form.set("timeout_limit", timeout_limit);
    form.set("debug_on", debug_on);
    form.set("test_mode", test_mode);
    form.set("lang", lang);
    form.set("no_installment", no_installment);
    form.set("max_installment", max_installment);
    form.set("currency", currency);
    form.set("paytr_token", paytr_token);

    // iFrame V2 :contentReference[oaicite:9]{index=9}
    form.set("iframe_v2", "1");
    form.set("iframe_v2_dark", "0");

    const r = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });

    const text = await r.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ ok: false, code: "PAYTR_BAD_RESPONSE", reason: text }, { status: 502 });
    }

    const PaytrRespSchema = z.object({
      status: z.string(),
      token: z.string().optional(),
      reason: z.string().optional(),
    });

    const pr = PaytrRespSchema.parse(parsed);

    if (pr.status !== "success" || !pr.token) {
      return NextResponse.json(
        { ok: false, code: "PAYTR_TOKEN_FAILED", reason: pr.reason ?? "UNKNOWN" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: true, token: pr.token, merchantOid: merchant_oid, amount: payment_amount, package: pkg },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
