import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";
import { normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

const ListQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["all", "published", "draft"]).optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
});

function parseListQuery(url: URL) {
  const q = url.searchParams.get("q") ?? undefined;
  const status = (url.searchParams.get("status") ?? undefined) as
    | "all"
    | "published"
    | "draft"
    | undefined;
  const take = url.searchParams.get("take") ?? undefined;

  return ListQuerySchema.parse({ q, status, take });
}

const CreateSchema = z.object({
  title: z.string().min(3).max(140),
  slug: z.string().min(3).max(180).optional(),
  excerpt: z.string().max(260).optional().nullable(),
  content: z.string().min(20),
  isPublished: z.boolean().optional(),
});

type CreateInput = z.infer<typeof CreateSchema>;

function buildUniqueSlug(base: string): string {
  const s = normalizeSlug(base).slice(0, 180);
  return s || `yazi-${Date.now()}`;
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const url = new URL(req.url);
    const { q, status = "all", take = 100 } = parseListQuery(url);

    const whereQ =
      q && q.trim().length >= 2
        ? {
            OR: [
              { title: { contains: q.trim(), mode: "insensitive" as const } },
              { slug: { contains: q.trim(), mode: "insensitive" as const } },
              { content: { contains: q.trim(), mode: "insensitive" as const } },
            ],
          }
        : {};

    const whereStatus =
      status === "published"
        ? { isPublished: true }
        : status === "draft"
          ? { isPublished: false }
          : {};

    const posts = await prisma.blogPost.findMany({
      where: {
        ...whereQ,
        ...whereStatus,
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const json: unknown = await req.json();
    const data: CreateInput = CreateSchema.parse(json);

    const baseSlug = buildUniqueSlug(data.slug?.trim() || data.title.trim());
    let slug = baseSlug;

    // slug unique garanti
    let i = 2;
    while (true) {
      const exists = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
      if (!exists) break;
      slug = `${baseSlug}-${i++}`;
    }

    const isPublished = data.isPublished ?? false;

    const created = await prisma.blogPost.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt: (data.excerpt ?? null)?.toString().trim() || null,
        content: data.content,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
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

    return NextResponse.json({ ok: true, post: created }, { status: 201 });
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
