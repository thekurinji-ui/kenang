import { getLandingStats, isGrowthPhase, formatStatNumber } from "@/lib/landing-stats";

// Homepage Blueprint v3.3 — Section 3 (Social Proof)
// Fallback growth copy dipakai kalau jumlah event masih kecil di awal,
// supaya section ini tetap terasa meyakinkan (lihat Catatan Teknis blueprint).
const GROWTH_ITEMS = [
  "Event baru bergabung setiap minggu",
  "Momen tamu, bukan fotografer, yang mengisi galerinya",
  "Terus bertambah — jadi bagian dari cerita berikutnya",
];

export async function LandingSocialProof() {
  const stats = await getLandingStats();
  const growthPhase = isGrowthPhase(stats);

  const items = growthPhase
    ? GROWTH_ITEMS
    : [
        `${formatStatNumber(stats.totalEvents)} Event Diabadikan`,
        `${formatStatNumber(stats.totalPhotos)} Foto Terkumpul`,
        `${formatStatNumber(stats.totalGuests)} Tamu Berpartisipasi`,
      ];

  // Track digandakan sekali — animasi geser -50% jadi looping mulus tanpa jeda.
  const marqueeItems = [...items, ...items];

  return (
    <section className="border-y border-neutral-slate/70 bg-neutral-white py-6">
      <div
        className="group relative flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap px-4 font-body text-sm font-medium text-neutral-midnight/60"
            >
              {item}
              <span aria-hidden className="text-crimson">
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
