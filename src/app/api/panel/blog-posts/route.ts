import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { slugifyTR } from "@/lib/slug";

type CreateBody = {
  title: string;
  excerpt?: string;
  content: string;
};

export async function GET(): Promise<Response> {
  const session = await requireClinic();

  const posts = await prisma.blogPost.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { updatedAt: "desc" },
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
    take: 200,
  });

  return NextResponse.json({ ok: true, posts });
}

export async function POST(req: Request): Promise<Response> {
  const session = await requireClinic();

  const can = await hasActiveSubscription(session.clinicId);
  if (!can) {
    return NextResponse.json({ ok: false, code: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
  }

  const body = (await req.json()) as Partial<CreateBody>;
  const title = (body.title ?? "").trim();
  const excerpt = (body.excerpt ?? "").trim();
  const content = (body.content ?? "").trim();

  if (title.length < 8) {
    return NextResponse.json({ ok: false, code: "TITLE_TOO_SHORT" }, { status: 400 });
  }
  if (content.length < 50) {
    return NextResponse.json({ ok: false, code: "CONTENT_TOO_SHORT" }, { status: 400 });
  }
  if (excerpt.length > 320) {
    return NextResponse.json({ ok: false, code: "EXCERPT_TOO_LONG" }, { status: 400 });
  }

  const base = slugifyTR(title);
  const uniqueSlug = `${base}-${Date.now().toString(36)}`;

  const post = await prisma.blogPost.create({
    data: {
      clinicId: session.clinicId,
      slug: uniqueSlug,
      title,
      excerpt: excerpt || null,
      content,
      isPublished: false,
      publishedAt: null,
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

  return NextResponse.json({ ok: true, post });
}