import { Sparkles, Wand2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// Homepage Blueprint v3.3 — Section 12 (Fitur AI)
// Blueprint minta 2-3 fitur unggulan ditonjolkan di homepage (sisanya di
// halaman /features), masing-masing dengan demo visual ringkas.
const AI_FEATURES = [
  {
    icon: Sparkles,
    title: "AI Best Shot",
    description:
      "Dari ratusan foto satu event, AI otomatis menandai jepretan terbaik — fokus tajam, ekspresi pas, komposisi bagus — jadi kamu nggak perlu sortir manual.",
    demo: <BestShotDemo />,
  },
  {
    icon: Wand2,
    title: "AI Story",
    description:
      "AI merangkai highlight foto & momen jadi satu cerita singkat per event, lengkap dengan urutan yang enak diikuti — siap dibagikan ke tamu.",
    demo: <AiStoryDemo />,
  },
  {
    icon: LayoutGrid,
    title: "AI Smart Gallery",
    description:
      "Foto blur, duplikat, atau gelap otomatis disaring dari galeri utama, dikelompokkan berdasarkan momen — galeri tetap rapi meski ribuan foto masuk.",
    demo: <SmartGalleryDemo />,
  },
];

export function LandingAiFeatures() {
  return (
    <section id="ai" className="bg-neutral-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-royal-50 bg-royal-50 px-3 py-1 font-body text-xs font-medium text-royal-600">
            <Sparkles size={12} aria-hidden />
            Ditenagai AI
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Galeri yang Merapikan Dirinya Sendiri
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Ribuan foto dari puluhan tamu jadi gampang dipahami — AI Kenang
            Kurinji bantu pilih, susun, dan bersihkan galerimu secara otomatis.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {AI_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col overflow-hidden rounded-lg border border-neutral-slate bg-neutral-white shadow-soft"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-midnight p-6">
                  {feature.demo}
                </div>
                <div className="p-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-crimson-50 text-crimson">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-neutral-midnight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-neutral-midnight/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-body text-sm text-neutral-midnight/50">
          Fitur AI tersedia mulai paket{" "}
          <span className="font-medium text-neutral-midnight/70">Gunung Tujuh</span>.{" "}
          <a href="/features" className="text-crimson hover:text-crimson-600">
            Lihat semua fitur →
          </a>
        </p>
      </div>
    </section>
  );
}

/** Demo mini: grid foto dengan satu foto ditandai sebagai "Best Shot". */
function BestShotDemo() {
  return (
    <div className="grid w-full max-w-[180px] grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => {
        const isBest = i === 1;
        return (
          <div
            key={i}
            className={cn(
              "relative aspect-square rounded-sm bg-[radial-gradient(circle_at_35%_30%,#F5A609_0%,transparent_50%),radial-gradient(circle_at_70%_65%,#D62828_0%,transparent_55%)]",
              isBest ? "ring-2 ring-gold-400" : "opacity-50"
            )}
          >
            {isBest && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-neutral-midnight">
                <Sparkles size={9} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Demo mini: strip foto tersusun jadi satu urutan cerita. */
function AiStoryDemo() {
  return (
    <div className="flex w-full max-w-[200px] items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 flex-1 rounded-sm bg-[radial-gradient(circle_at_40%_30%,#1D4ED8_0%,transparent_55%),radial-gradient(circle_at_65%_70%,#F5A609_0%,transparent_50%)]"
          style={{ opacity: 0.5 + i * 0.15 }}
        />
      ))}
      <Wand2 size={14} className="ml-1 shrink-0 text-neutral-white/60" />
    </div>
  );
}

/** Demo mini: grid galeri dengan beberapa foto "disaring" (redup/silang). */
function SmartGalleryDemo() {
  return (
    <div className="grid w-full max-w-[180px] grid-cols-4 gap-1.5">
      {Array.from({ length: 8 }).map((_, i) => {
        const filtered = i === 2 || i === 5;
        return (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm bg-[radial-gradient(circle_at_35%_30%,#D62828_0%,transparent_50%),radial-gradient(circle_at_70%_65%,#1D4ED8_0%,transparent_55%)]",
              filtered ? "opacity-15 blur-[1px]" : "opacity-80"
            )}
          />
        );
      })}
    </div>
  );
}
