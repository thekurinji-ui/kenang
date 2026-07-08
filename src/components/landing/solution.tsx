import Link from "next/link";
import { QrCode, Camera, Images, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Homepage Blueprint v3.3 — Section 8 (Solution)
// Catatan Persona: alur utama ini dari sudut pandang TAMU. Host cuma
// disebut lewat CTA "Buat Event" terpisah, bukan sebagai langkah yang setara.
const GUEST_STEPS = [
  { icon: QrCode, label: "Scan QR" },
  { icon: Camera, label: "Ambil Foto" },
  { icon: Images, label: "Tersimpan Otomatis" },
];

export function LandingSolution() {
  return (
    <section className="bg-neutral-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
          Semudah Ini, dari Sudut Pandang Tamu
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-body text-neutral-midnight/70">
          Tidak perlu install aplikasi. Tidak perlu login. Tamu tinggal jalan,
          sisanya otomatis.
        </p>

        <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-4">
          {GUEST_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4 sm:gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crimson-50 text-crimson">
                  <step.icon size={26} strokeWidth={1.75} />
                </div>
                <span className="font-body text-sm font-medium text-neutral-midnight">
                  {step.label}
                </span>
              </div>
              {i < GUEST_STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden
                  size={20}
                  className="hidden shrink-0 text-neutral-midnight/25 sm:block"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-xl border border-neutral-slate bg-neutral-white px-6 py-6 shadow-soft">
          <p className="font-body text-sm text-neutral-midnight/70">
            Kamu yang punya acara?{" "}
            <span className="font-medium text-neutral-midnight">
              Peranmu cuma satu langkah.
            </span>
          </p>
          <Link href="/register">
            <Button variant="primary">Buat Event</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
