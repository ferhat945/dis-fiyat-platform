import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import { hasActiveSubscription } from "@/lib/subscription";

type UpdateBody = {
  title?: string;
  excerpt?: string;
  content?: string;
};

function pickStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await requireClinic();
  const { id } = await ctx.params;

  const can = await hasActiveSubscription(session.clinicId);
  if (!can) {
    return NextResponse.json({ ok: false, code: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
  }

  const exists = await prisma.blogPost.findFirst({
    where: { id, clinicId: session.clinicId },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  const body = (await req.json()) as Partial<UpdateBody>;

  const title = pickStr(body.title).trim();
  const excerpt = pickStr(body.excerpt).trim();
  const content = pickStr(body.content).trim();

  if (title && title.length < 8) {
    return NextResponse.json({ ok: false, code: "TITLE_TOO_SHORT" }, { status: 400 });
  }
  if (excerpt && excerpt.length > 320) {
    return NextResponse.json({ ok: false, code: "EXCERPT_TOO_LONG" }, { status: 400 });
  }
  if (content && content.length < 50) {
    return NextResponse.json({ ok: false, code: "CONTENT_TOO_SHORT" }, { status: 400 });
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(title ? { title } : {}),
      ...(excerpt ? { excerpt } : { excerpt: excerpt === "" ? null : undefined }),
      ...(content ? { content } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await requireClinic();
  const { id } = await ctx.params;

  const exists = await prisma.blogPost.findFirst({
    where: { id, clinicId: session.clinicId },
    select: { id: true },
  });

  if (!exists) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}