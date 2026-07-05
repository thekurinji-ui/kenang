import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section className="bg-neutral-midnight px-6 py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="font-heading text-3xl font-semibold text-neutral-white md:text-4xl">
          Siap kumpulkan kenangan dari sudut pandang setiap tamu?
        </h2>
        <p className="max-w-xl font-body text-neutral-white/60">
          Buat event pertamamu gratis, sebar QR code, dan lihat momen mengalir
          masuk ke galerimu secara real-time.
        </p>
        <Link href="/register">
          <Button variant="primary" className="px-6 py-3 text-base">
            Buat Event Gratis
          </Button>
        </Link>
      </div>
    </section>
  );
}
