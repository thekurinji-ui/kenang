import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-neutral-white px-6 pb-20 pt-16 md:pb-28 md:pt-24">
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

        <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-neutral-midnight md:text-6xl">
          Setiap tamu, sudut pandangnya sendiri.
        </h1>

        <p className="max-w-xl font-body text-base text-neutral-midnight/70 md:text-lg">
          Kenang Kurinji mengubah HP setiap tamu jadi kamera roll film digital.
          Scan QR, jepret momen, dan kumpulkan semuanya jadi satu galeri kenangan
          — tanpa perlu install aplikasi.
        </p>

        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button variant="primary" className="px-6 py-3 text-base">
              Buat Event Gratis
            </Button>
          </Link>
          <Link href="/e/pernikahan-demo">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Coba Kamera Demo
            </Button>
          </Link>
        </div>

        <p className="font-body text-xs text-neutral-midnight/50">
          Tidak perlu kartu kredit — event pertama gratis selamanya.
        </p>
      </div>
    </section>
  );
}
