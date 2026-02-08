import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) throw new Error(`MISSING_ENV_${name}`);
  return v.trim();
}

type CallbackBody = {
  merchant_oid: string;
  status: "success" | "failed";
  total_amount: string; // PayTR string gönderiyor
  hash: string;
};

function parseMerchantOid(merchantOid: string): { clinicId: string; pkg: "base" | "extra" } | null {
  // merchant_oid: DFP-{clinicId}-{pkg}-{ts}
  const parts = merchantOid.split("-");
  if (parts.length < 4) return null;
  if (parts[0] !== "DFP") return null;
  const clinicId = parts[1] ?? "";
  const pkg = parts[2] ?? "";
  if (pkg !== "base" && pkg !== "extra") return null;
  if (clinicId.length < 5) return null;
  return { clinicId, pkg };
}

function packageAmountKurus(pkg: "base" | "extra"): number {
  return pkg === "base" ? 80000 : 60000;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const merchant_key = requireEnv("PAYTR_MERCHANT_KEY");
    const merchant_salt = requireEnv("PAYTR_MERCHANT_SALT");

    const body = (await req.formData()) as FormData;

    const cb: CallbackBody = {
      merchant_oid: String(body.get("merchant_oid") ?? ""),
      status: (String(body.get("status") ?? "") as "success" | "failed") || "failed",
      total_amount: String(body.get("total_amount") ?? ""),
      hash: String(body.get("hash") ?? ""),
    };

    // Hash doğrulama: Node örneği ile aynı :contentReference[oaicite:10]{index=10}
    const paytr_token_str = `${cb.merchant_oid}${merchant_salt}${cb.status}${cb.total_amount}`;
    const token = crypto.createHmac("sha256", merchant_key).update(paytr_token_str).digest("base64");

    if (token !== cb.hash) {
      return NextResponse.json({ ok: false, code: "PAYTR_BAD_HASH" }, { status: 400 });
    }

    // Başarısızsa OK dön (PayTR tekrar yollamasın)
    if (cb.status !== "success") {
      return new NextResponse("OK", { status: 200 });
    }

    const parsed = parseMerchantOid(cb.merchant_oid);
    if (!parsed) {
      return new NextResponse("OK", { status: 200 });
    }

    // Tutar doğrulama (basit güvenlik)
    const expected = packageAmountKurus(parsed.pkg);
    if (Number(cb.total_amount) !== expected) {
      // Tutar uyuşmazsa işlem yapma ama OK dön
      return new NextResponse("OK", { status: 200 });
    }

    // Kota ekle: +10 lead, 30 gün uzat (aktif sub varsa update, yoksa create)
    const addLeads = 10;
    const now = new Date();
    const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const active = await prisma.subscription.findFirst({
      where: {
        clinicId: parsed.clinicId,
        status: "active",
        expiresAt: { gt: now },
      },
      orderBy: { startedAt: "desc" },
      select: { id: true, expiresAt: true },
    });

    if (!active) {
      await prisma.subscription.create({
        data: {
          clinicId: parsed.clinicId,
          status: "active",
          quotaTotal: addLeads,
          quotaUsed: 0,
          startedAt: now,
          expiresAt: newExpiry,
        },
      });

      return new NextResponse("OK", { status: 200 });
    }

    await prisma.subscription.update({
      where: { id: active.id },
      data: {
        quotaTotal: { increment: addLeads },
        expiresAt: active.expiresAt < newExpiry ? newExpiry : active.expiresAt,
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch {
    // PayTR callback'te hata olsa bile genelde OK dönmek tercih edilir,
    // aksi halde PayTR tekrar tekrar post atabilir.
    return new NextResponse("OK", { status: 200 });
  }
}
