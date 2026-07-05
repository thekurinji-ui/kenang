import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Rp0",
    period: "selamanya",
    description: "Cukup untuk mencoba di acara kecil.",
    features: ["1 event aktif", "50 foto per event", "6 film preset", "Galeri dasar"],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "Rp99rb",
    period: "per event",
    description: "Pas untuk ulang tahun, gathering, dan acara komunitas.",
    features: [
      "1 event",
      "500 foto",
      "6 film preset",
      "Download galeri ZIP",
      "Hapus watermark",
    ],
    cta: "Pilih Plus",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp299rb",
    period: "per event",
    description: "Untuk pernikahan dan acara besar dengan banyak tamu.",
    features: [
      "1 event",
      "Foto tanpa batas",
      "Semua film preset",
      "Albums & organisasi foto",
      "Analytics lengkap",
      "Prioritas support",
    ],
    cta: "Pilih Pro",
    highlighted: false,
  },
  {
    id: "business",
    name: "Business",
    price: "Kustom",
    period: "per bulan",
    description: "Untuk vendor & event organizer dengan banyak acara.",
    features: [
      "Event tanpa batas",
      "Foto tanpa batas",
      "White-label branding",
      "Multi-admin",
      "Dedicated support",
    ],
    cta: "Hubungi Kami",
    highlighted: false,
  },
];

export function LandingPricing() {
  return (
    <section id="harga" className="bg-neutral-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Harga Sederhana, Tanpa Kejutan
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Bayar per event, bukan langganan bulanan yang bikin bingung.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-lg border p-6 shadow-soft",
                plan.highlighted
                  ? "border-crimson bg-crimson-50/40 shadow-medium"
                  : "border-neutral-slate bg-neutral-white"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-crimson px-3 py-1 font-body text-xs font-semibold text-neutral-white">
                  Paling Populer
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold text-neutral-midnight">
                {plan.name}
              </h3>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-3xl font-semibold text-neutral-midnight">
                  {plan.price}
                </span>
                <span className="font-body text-sm text-neutral-midnight/50">
                  /{plan.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 font-body text-sm text-neutral-midnight/80"
                  >
                    <span className="mt-0.5 text-crimson" aria-hidden>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-6">
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
