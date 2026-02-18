import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";
import { normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function extractId(v: string): string {
  const s = (v ?? "").trim();
  if (!s) return "";
  const idx = s.lastIndexOf("--");
  if (idx >= 0 && idx + 2 < s.length) return s.slice(idx + 2);
  return s;
}

const PatchSchema = z.object({
  title: z.string().min(3).max(140).optional(),
  slug: z.string().min(3).max(180).optional(),
  excerpt: z.string().max(260).optional().nullable(),
  content: z.string().min(20).optional(),
  isPublished: z.boolean().optional(),
});

type PatchInput = z.infer<typeof PatchSchema>;

function safeSlug(input: string): string {
  const s = normalizeSlug(input).slice(0, 180);
  return s || `yazi-${Date.now()}`;
}

export async function GET(req: Request, ctx: Ctx): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const { id } = await ctx.params;
    const postId = extractId(id);

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true, post }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function PATCH(req: Request, ctx: Ctx): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const { id } = await ctx.params;
    const postId = extractId(id);

    const json: unknown = await req.json();
    const data: PatchInput = PatchSchema.parse(json);

    const current = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true, isPublished: true, slug: true },
    });
    if (!current) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

    // slug unique (değişiyorsa)
    let nextSlug: string | undefined;
    if (typeof data.slug === "string") {
      const base = safeSlug(data.slug.trim());
      let slug = base;
      let i = 2;
      while (true) {
        const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
        if (!exists || exists.id === postId) break;
        slug = `${base}-${i++}`;
      }
      nextSlug = slug;
    }

    // publish geçişi
    let publishedAt: Date | null | undefined;
    if (typeof data.isPublished === "boolean") {
      if (data.isPublished && !current.isPublished) publishedAt = new Date();
      if (!data.isPublished && current.isPublished) publishedAt = null;
    }

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ...(typeof data.title === "string" ? { title: data.title.trim() } : {}),
        ...(typeof nextSlug === "string" ? { slug: nextSlug } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt ? data.excerpt.trim() : null } : {}),
        ...(typeof data.content === "string" ? { content: data.content } : {}),
        ...(typeof data.isPublished === "boolean" ? { isPublished: data.isPublished } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, post: updated }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const { id } = await ctx.params;
    const postId = extractId(id);

    const exists = await prisma.blogPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!exists) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

    await prisma.blogPost.delete({ where: { id: postId } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
