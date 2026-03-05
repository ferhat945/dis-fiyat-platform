import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import { hasActiveSubscription } from "@/lib/subscription";

type Body = { publish: boolean };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await requireClinic();
  const { id } = await ctx.params;

  const can = await hasActiveSubscription(session.clinicId);
  if (!can) {
    return NextResponse.json({ ok: false, code: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
  }

  const body = (await req.json()) as Partial<Body>;
  const publish = Boolean(body.publish);

  const post = await prisma.blogPost.findFirst({
    where: { id, clinicId: session.clinicId },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: publish
      ? { isPublished: true, publishedAt: new Date() }
      : { isPublished: false, publishedAt: null },
    select: { id: true, isPublished: true, publishedAt: true },
  });

  return NextResponse.json({ ok: true, post: updated });
}