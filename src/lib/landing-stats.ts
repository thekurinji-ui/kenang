import { prisma } from "@/lib/prisma";

export interface LandingStats {
  totalEvents: number;
  totalPhotos: number;
  totalGuests: number;
}

// Homepage Blueprint v3.3 — Section 3 (Social Proof)
// Di bawah angka ini, tampilkan frasa yang menekankan pertumbuhan, bukan
// angka absolut yang masih kecil dan justru bikin ragu calon pengguna baru.
const GROWTH_PHASE_THRESHOLD = 20;

export async function getLandingStats(): Promise<LandingStats> {
  const [totalEvents, aggregate] = await Promise.all([
    prisma.event.count({
      where: { deletedAt: null, status: { in: ["LIVE", "ENDED", "ARCHIVED"] } },
    }),
    prisma.analytics.aggregate({
      _sum: { totalPhotos: true, totalGuests: true },
    }),
  ]);

  return {
    totalEvents,
    totalPhotos: aggregate._sum.totalPhotos ?? 0,
    totalGuests: aggregate._sum.totalGuests ?? 0,
  };
}

export function isGrowthPhase(stats: LandingStats): boolean {
  return stats.totalEvents < GROWTH_PHASE_THRESHOLD;
}

export function formatStatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
