import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { adminCreateEventSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";

const PAGE_SIZE = 20;

// GET /api/v1/admin/events?search=&page=1 — daftar semua event di platform
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

  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { owner: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        description: true,
        eventDate: true,
        location: true,
        revealMode: true,
        shotLimit: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        analytics: { select: { totalPhotos: true, totalGuests: true, storageUsed: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: events,
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  });
}

// POST /api/v1/admin/events — admin membuat event atas nama client (by email)
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminCreateEventSchema.safeParse(body);
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

  const { ownerEmail, title, description, eventDate, location, revealMode, shotLimit } =
    parsed.data;

  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) {
    return NextResponse.json(
      { success: false, message: "Client dengan email tersebut tidak ditemukan", code: "OWNER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const slug = await generateUniqueSlug(title);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const event = await prisma.event.create({
    data: {
      ownerId: owner.id,
      title,
      slug,
      description,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      location,
      revealMode,
      shotLimit: shotLimit ?? null,
      status: "DRAFT",
      qrCode: {
        create: { code: slug, url: `${appUrl}/e/${slug}` },
      },
      analytics: { create: {} },
    },
    include: { qrCode: true, owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ success: true, data: event }, { status: 201 });
}
