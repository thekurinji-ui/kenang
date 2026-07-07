import Link from "next/link";
import { Button } from "@/components/ui/button";

// Homepage Blueprint v3.3 — Section 2 (Hero)
export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-neutral-white px-6 pb-16 pt-16 md:pb-24 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-crimson-50 blur-3xl md:h-96 md:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] h-72 w-72 rounded-full bg-royal-50 blur-3xl md:h-96 md:w-96"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-slate bg-neutral-white px-4 py-1.5 font-body text-xs font-medium text-neutral-midnight/70 shadow-soft">
          <span aria-hidden>✨</span>
          Kamera disposable, tanpa kamera fisik
        </span>

        <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-neutral-midnight md:text-7xl">
          Scan. Jepret. Kenang.
        </h1>

        <p className="max-w-xl font-body text-base text-neutral-midnight/70 md:text-lg">
          <span className="font-medium text-neutral-midnight">
            Setiap tamu, sudut pandangnya sendiri.
          </span>{" "}
          Kenang Kurinji mengubah HP setiap tamu menjadi kamera roll film digital.
          Cukup scan QR, jepret momen, lalu kumpulkan semuanya menjadi satu galeri
          kenangan — tanpa perlu install aplikasi.
        </p>

        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button variant="primary" className="px-6 py-3 text-base">
              Buat Event
            </Button>
          </Link>
          <Link href="/e/pernikahan-demo">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Lihat Demo
            </Button>
          </Link>
        </div>

        <p className="font-body text-xs text-neutral-midnight/50">
          Tidak perlu kartu kredit — event pertama gratis 30 hari.
        </p>

        <HeroPhoneMockup />
      </div>
    </section>
  );
}

/**
 * Signature visual (Blueprint: "Mockup iPhone dengan tampilan kamera Kenang
 * Kurinji dan latar foto candid bernuansa hangat"). Dibangun murni dari
 * CSS/SVG — bukan foto asli — jadi selalu tampil konsisten tanpa bergantung
 * pada aset gambar. Elemen film counter ("12/24") sengaja meminjam motif
 * Roll Film dari fitur kamera aslinya, supaya hero terasa nyambung dengan
 * produk beneran, bukan mockup generik.
 */
function HeroPhoneMockup() {
  return (
    <div className="relative mt-8 md:mt-12">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 -z-10 h-64 -translate-y-1/2 bg-gradient-to-r from-crimson-50 via-gold-400/10 to-royal-50 blur-3xl"
      />

      <div className="relative h-[520px] w-[260px] rounded-[3rem] border-[10px] border-neutral-midnight bg-neutral-midnight shadow-floating md:h-[580px] md:w-[290px]">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-midnight" />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] bg-neutral-midnight">
          {/* Warm candid backdrop, simulated bokeh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#F5A609_0%,transparent_45%),radial-gradient(circle_at_75%_35%,#D62828_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#1D4ED8_0%,transparent_55%)] opacity-70" />
          <div className="absolute inset-0 bg-neutral-midnight/30" />
          <div
            aria-hidden
            className="absolute h-10 w-10 rounded-full bg-gold-400/60 blur-md"
            style={{ top: "22%", left: "24%" }}
          />
          <div
            aria-hidden
            className="absolute h-16 w-16 rounded-full bg-crimson/40 blur-lg"
            style={{ top: "55%", left: "65%" }}
          />
          <div
            aria-hidden
            className="absolute h-8 w-8 rounded-full bg-royal-50/50 blur-md"
            style={{ top: "70%", left: "20%" }}
          />

          {/* Film grain / vignette texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(17,24,39,0.55)_100%)]" />

          {/* Camera UI chrome */}
          <div className="absolute inset-x-0 top-9 flex items-center justify-between px-4">
            <span className="rounded-full bg-neutral-midnight/50 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-neutral-white/90 backdrop-blur-sm">
              KURINJI
            </span>
            <span className="rounded-full bg-neutral-midnight/50 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-neutral-white/90 backdrop-blur-sm">
              12 / 24
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-3">
            <span className="font-mono text-[9px] tracking-[0.2em] text-neutral-white/60">
              FUJI ETERNA 250D
            </span>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-neutral-white/90">
              <div className="h-11 w-11 rounded-full bg-neutral-white/95" />
            </div>
          </div>
        </div>
      </div>

      {/* Sprocket holes — roll film identity, running down the right edge */}
      <div
        aria-hidden
        className="absolute -right-3 top-6 hidden flex-col gap-3 md:flex"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-3 w-2 rounded-[2px] bg-neutral-slate" />
        ))}
      </div>
    </div>
  );
}
