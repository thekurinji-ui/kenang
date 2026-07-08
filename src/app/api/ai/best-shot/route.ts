import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, hasAIAccess, PLAN_LIMITS } from "@/lib/plans";
import { runPhotoAiPipeline, recomputeBestShotBadge } from "@/lib/ai-pipeline";
import { publicUrl } from "@/lib/r2";

// AI Features v3.0 — Feature 1: AI Best Shot
// Skor per-foto sebenarnya dihitung asynchronous tiap ada upload baru (lihat
// waitUntil di src/app/api/v1/uploads/route.ts). Route ini untuk:
// - GET  : lihat leaderboard Best Shot event yang sudah ada saat ini.
// - POST : proses ulang foto yang BELUM sempat dianalisis (mis. upload lama
//          sebelum fitur AI ini aktif, atau retry setelah analisis gagal).

const BATCH_SIZE = 50; // batasi per-request biar tidak timeout di serverless

async function requireEventOwnerWithAIAccess(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ownerId !== session.user.id) {
    return {
      error: NextResponse.json(
        { success: false, message: "Event tidak ditemukan", code: "NOT_FOUND" },
        { status: 404 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscription: { select: { plan: true, status: true, expiresAt: true } } },
  });
  const plan = getEffectivePlan(user?.subscription);

  if (!hasAIAccess(plan)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: `Fitur AI Best Shot tersedia mulai paket ${PLAN_LIMITS.GUNUNG_TUJUH.name} ke atas.`,
          code: "PLAN_RESTRICTED",
        },
        { status: 403 }
      ),
    };
  }

  return { event };
}

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const check = await requireEventOwnerWithAIAccess(eventId);
  if (check.error) return check.error;

  const photos = await prisma.photo.findMany({
    where: { eventId, aiScore: { not: null } },
    orderBy: { aiScore: "desc" },
    take: 20,
  });

  return NextResponse.json({
    success: true,
    data: photos.map((p) => ({
      id: p.id,
      url: publicUrl(p.storageKey),
      score: p.aiScore,
      reason: p.aiReason,
      isBestShot: p.aiIsBestShot,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const eventId = body?.eventId;
  if (typeof eventId !== "string") {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const check = await requireEventOwnerWithAIAccess(eventId);
  if (check.error) return check.error;

  const pending = await prisma.photo.findMany({
    where: { eventId, aiAnalyzedAt: null },
    select: { id: true },
    take: BATCH_SIZE,
  });

  // Sengaja sequential (bukan Promise.all) biar tidak membanjiri rate limit
  // OpenAI kalau ada ratusan foto pending sekaligus.
  for (const photo of pending) {
    await runPhotoAiPipeline(photo.id);
  }
  await recomputeBestShotBadge(eventId);

  return NextResponse.json({
    success: true,
    message: `${pending.length} foto berhasil dianalisis.`,
    data: { analyzed: pending.length, remaining: pending.length === BATCH_SIZE },
  });
}
