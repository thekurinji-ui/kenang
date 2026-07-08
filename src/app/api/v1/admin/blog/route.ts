import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createBlogPostSchema } from "@/lib/validation";
import { generateUniqueBlogSlug } from "@/lib/slug";

const PAGE_SIZE = 20;

// GET /api/v1/admin/blog?search=&page=1 — semua artikel (draft + published)
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const where = search
    ? { title: { contains: search, mode: "insensitive" as const } }
    : {};

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: posts,
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  });
}

// POST /api/v1/admin/blog — bikin artikel baru (default DRAFT)
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createBlogPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Data tidak valid",
        code: "VALIDATION_ERROR",
      },
      { status: 422 }
    );
  }

  const { title, excerpt, content, coverImage, status } = parsed.data;
  const slug = await generateUniqueBlogSlug(title);
  const isPublishing = status === "PUBLISHED";

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status: status ?? "DRAFT",
      authorId: guard.session.user.id,
      publishedAt: isPublishing ? new Date() : null,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: post }, { status: 201 });
}
