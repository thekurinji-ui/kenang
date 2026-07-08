import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, hasAIAccess, PLAN_LIMITS } from "@/lib/plans";
import { runPhotoAiPipeline } from "@/lib/ai-pipeline";
import { publicUrl } from "@/lib/r2";

// AI Features v3.0 — Feature 3: AI Smart Gallery
// Kategorisasi per-foto sebenarnya sudah jalan bareng Best Shot scoring
// (satu pipeline, satu panggilan OpenAI per foto — lihat lib/ai-pipeline.ts)
// yang dipicu asynchronous tiap ada upload baru. Route ini untuk:
// - GET  : ambil hasil pengelompokan foto per kategori untuk ditampilkan
//          di gallery.
// - POST : proses ulang foto yang belum dianalisis (backfill).

const BATCH_SIZE = 50;

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const photos = await prisma.photo.findMany({
    where: { eventId, aiCategory: { not: null } },
    orderBy: { uploadedAt: "desc" },
  });

  const grouped: Record<string, { id: string; url: string }[]> = {};
  for (const photo of photos) {
    const category = photo.aiCategory as string;
    grouped[category] ??= [];
    grouped[category].push({ id: photo.id, url: publicUrl(photo.storageKey) });
  }

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const eventId = body?.eventId;
  if (typeof eventId !== "string") {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ownerId !== session.user.id) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscription: { select: { plan: true, status: true, expiresAt: true } } },
  });
  const plan = getEffectivePlan(user?.subscription);

  if (!hasAIAccess(plan)) {
    return NextResponse.json(
      {
        success: false,
        message: `Fitur AI Smart Gallery tersedia mulai paket ${PLAN_LIMITS.GUNUNG_TUJUH.name} ke atas.`,
        code: "PLAN_RESTRICTED",
      },
      { status: 403 }
    );
  }

  const pending = await prisma.photo.findMany({
    where: { eventId, aiAnalyzedAt: null },
    select: { id: true },
    take: BATCH_SIZE,
  });

  for (const photo of pending) {
    await runPhotoAiPipeline(photo.id);
  }

  return NextResponse.json({
    success: true,
    message: `${pending.length} foto berhasil dikategorikan.`,
    data: { processed: pending.length, remaining: pending.length === BATCH_SIZE },
  });
}
