import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// GET /api/v1/admin/stats — ringkasan angka untuk overview dashboard admin
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const [
    totalUsers,
    totalEvents,
    totalPhotos,
    totalGuests,
    storageAgg,
    revenueAgg,
    planCounts,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.photo.count(),
    prisma.guest.count(),
    prisma.analytics.aggregate({ _sum: { storageUsed: true } }),
    prisma.paymentOrder.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      totalEvents,
      totalPhotos,
      totalGuests,
      storageUsedBytes: storageAgg._sum.storageUsed ?? 0,
      totalRevenue: revenueAgg._sum.amount ?? 0,
      planCounts: planCounts.map((p) => ({ plan: p.plan, count: p._count.plan })),
      recentUsers,
    },
  });
}
