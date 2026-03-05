import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import { normalizeSlug } from "@/lib/seo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreatePriceRangeBody = {
  city?: string;
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  isActive?: boolean;
};

function bad(code: string, status = 400) {
  return NextResponse.json({ ok: false, code }, { status });
}

export async function GET(): Promise<NextResponse> {
  const session = await requireClinic();
  const clinicId = session.clinicId;

  const items = await prisma.clinicPriceRange.findMany({
    where: { clinicId },
    orderBy: [{ city: "asc" }, { service: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await requireClinic();
  const clinicId = session.clinicId;

  let body: CreatePriceRangeBody;

  try {
    body = (await req.json()) as CreatePriceRangeBody;
  } catch {
    return bad("INVALID_JSON");
  }

  const city = normalizeSlug(body.city ?? "");
  const service = normalizeSlug(body.service ?? "");

  const minPrice = Number(body.minPrice);
  const maxPrice = Number(body.maxPrice);

  const currencyRaw = (body.currency ?? "TRY").toUpperCase();
  const currency =
    currencyRaw === "TRY" || currencyRaw === "USD" || currencyRaw === "EUR"
      ? currencyRaw
      : "TRY";

  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  if (!city || city.length < 2) return bad("CITY_REQUIRED");
  if (!service || service.length < 2) return bad("SERVICE_REQUIRED");

  if (!Number.isFinite(minPrice) || minPrice <= 0)
    return bad("MIN_PRICE_INVALID");

  if (!Number.isFinite(maxPrice) || maxPrice <= 0)
    return bad("MAX_PRICE_INVALID");

  if (maxPrice < minPrice) return bad("MAX_LT_MIN");

  const existing = await prisma.clinicPriceRange.findFirst({
    where: { clinicId, city, service },
    select: { id: true },
  });

  const item = existing
    ? await prisma.clinicPriceRange.update({
        where: { id: existing.id },
        data: {
          city,
          service,
          minPrice,
          maxPrice,
          currency,
          isActive,
        },
      })
    : await prisma.clinicPriceRange.create({
        data: {
          clinicId,
          city,
          service,
          minPrice,
          maxPrice,
          currency,
          isActive,
        },
      });

  return NextResponse.json({ ok: true, item });
}
