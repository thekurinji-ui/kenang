import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateBlogPostSchema } from "@/lib/validation";

// GET /api/v1/admin/blog/{id} — detail 1 artikel (dipakai form edit)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!post) {
    return NextResponse.json(
      { success: false, message: "Artikel tidak ditemukan", code: "POST_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: post });
}

// PATCH /api/v1/admin/blog/{id} — edit artikel, atau toggle status publish/unpublish
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Artikel tidak ditemukan", code: "POST_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateBlogPostSchema.safeParse(body);
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

  const { status, ...rest } = parsed.data;

  // publishedAt cuma di-set sekali, saat pertama kali status berubah jadi
  // PUBLISHED — supaya urutan/tanggal tampil di /blog tidak berubah-ubah
  // tiap kali admin unpublish lalu publish lagi.
  const publishedAtUpdate =
    status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {};

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(status !== undefined ? { status } : {}),
      ...publishedAtUpdate,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: post });
}

// DELETE /api/v1/admin/blog/{id}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Artikel tidak ditemukan", code: "POST_NOT_FOUND" },
      { status: 404 }
    );
  }

  await prisma.blogPost.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true, message: "Artikel berhasil dihapus" });
}
