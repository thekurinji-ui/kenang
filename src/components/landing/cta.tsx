import Link from "next/link";
import { Button } from "@/components/ui/button";

// Homepage Blueprint v3.3 — Section 15 (CTA Penutup)
export function LandingCta() {
  return (
    <section className="bg-neutral-midnight px-6 py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="font-heading text-3xl font-semibold text-neutral-white md:text-4xl">
          Siap Mengabadikan Momenmu?
        </h2>
        <p className="max-w-xl font-body text-neutral-white/60">
          Buat event pertamamu gratis, sebar QR code, dan lihat momen mengalir
          masuk ke galerimu secara real-time.
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button variant="primary" className="px-6 py-3 text-base">
              Buat Event
            </Button>
          </Link>
          <Link href="/e/pernikahan-demo">
            <Button
              variant="secondary"
              className="border-white/20 bg-transparent px-6 py-3 text-base text-neutral-white hover:bg-white/10"
            >
              Lihat Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
