import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureSection {
  title: string;
  items: string[];
}

interface Plan {
  id: string;
  icon: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted: boolean;
  sections: FeatureSection[];
  rollFilm: string[];
  cta: string;
  href: string;
}

const PLANS: Plan[] = [
  {
    id: "kincai",
    icon: "🌿",
    name: "Kincai",
    price: "Gratis",
    period: "30 hari",
    description: "Cukup untuk mencoba di acara kecil.",
    highlighted: false,
    sections: [
      {
        title: "Limit",
        items: ["1 event", "Maks. 10 tamu", "Maks. 100 foto", "Aktif 30 hari"],
      },
      {
        title: "Fitur",
        items: [
          "QR Upload",
          "Disposable Camera",
          "Gallery Online",
          "Download foto individu",
          "Watermark Kenang Kurinji",
        ],
      },
    ],
    rollFilm: ["5 jepretan per tamu (tetap)"],
    cta: "Mulai Gratis",
    href: "/register",
  },
  {
    id: "kurinji",
    icon: "🌸",
    name: "Kurinji",
    price: "Rp79.000",
    period: "per event",
    description: "Pilihan pas buat acara personal dengan tamu lebih banyak.",
    highlighted: true,
    sections: [
      {
        title: "Limit",
        items: [
          "1 event",
          "Maks. 100 tamu",
          "Maks. 4.000 foto",
          "Maks. 500 video",
          "Aktif 1 tahun",
        ],
      },
      {
        title: "Fitur",
        items: [
          "Semua fitur Kincai",
          "Tanpa watermark",
          "Guest book digital",
          "Reveal gallery",
          "Download ZIP",
          "Custom cover event",
          "Prioritas upload",
        ],
      },
    ],
    rollFilm: ["5", "12", "24 (Classic)", "39 (Extended)"],
    cta: "Pilih Kurinji",
    href: "/register",
  },
  {
    id: "gunung-tujuh",
    icon: "🌊",
    name: "Gunung Tujuh",
    price: "Rp199.000",
    period: "per event",
    description: "Untuk acara besar yang butuh kualitas dan kontrol penuh.",
    highlighted: false,
    sections: [
      {
        title: "Limit",
        items: [
          "1 event",
          "Maks. 300 tamu",
          "Maks. 12.000 foto",
          "Maks. 2.000 video",
          "Aktif 1 tahun",
        ],
      },
      { title: "Fitur", items: ["Semua fitur Kurinji"] },
      {
        title: "Film Collection",
        items: [
          "Fuji Eterna 250D",
          "Fuji F125",
          "Fuji Reala 500D",
          "Kodak 5218",
          "Kodak 5295",
          "Filmstock 50",
          "Late Sunset",
          "Night From Day",
        ],
      },
      {
        title: "Tambahan",
        items: [
          "Preview filter",
          "AI Best Shot",
          "AI Blur Detection",
          "Analytics dashboard",
          "Multi QR",
          "Album privat",
          "Password gallery",
          "Custom branding",
        ],
      },
    ],
    rollFilm: ["5", "12", "24", "39", "Unlimited", "Custom"],
    cta: "Pilih Gunung Tujuh",
    href: "/register",
  },
  {
    id: "gunung-kerinci",
    icon: "🏔",
    name: "Gunung Kerinci",
    price: "Kustom",
    period: "per bulan",
    description: "Untuk vendor & enterprise yang butuh solusi custom.",
    highlighted: false,
    sections: [
      {
        title: "Fitur",
        items: [
          "Semua fitur Gunung Tujuh",
          "Unlimited event",
          "Unlimited tamu",
          "Unlimited storage (fair use)",
          "White label",
          "Custom domain",
          "API access",
          "Multi user",
          "Team management",
          "Dedicated account manager",
          "Priority support",
          "Custom feature request",
        ],
      },
      {
        title: "Film Collection",
        items: ["Semua LUT", "Import LUT (.cube)", "Custom film collection", "Custom preset"],
      },
    ],
    rollFilm: ["Per QR area", "Per kategori tamu", "Custom"],
    cta: "Hubungi Kami",
    href: "/contact",
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

        <div
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4
                     lg:grid lg:grid-cols-4 lg:items-start lg:gap-6 lg:overflow-visible lg:pb-0"
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex w-[85%] shrink-0 snap-center flex-col rounded-lg border p-6 shadow-soft",
                "sm:w-[60%] lg:w-auto",
                plan.highlighted
                  ? "border-crimson bg-crimson-50/40 shadow-medium lg:-my-3 lg:scale-[1.04] lg:p-7"
                  : "border-neutral-slate bg-neutral-white"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-crimson px-3 py-1 font-body text-xs font-semibold text-neutral-white">
                  ⭐ Pilihan Terfavorit
                </span>
              )}

              <h3 className="flex items-center gap-1.5 font-heading text-lg font-semibold text-neutral-midnight">
                <span aria-hidden>{plan.icon}</span>
                {plan.name}
              </h3>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-3xl font-semibold text-neutral-midnight">
                  {plan.price}
                </span>
                <span className="font-body text-sm text-neutral-midnight/50">/{plan.period}</span>
              </div>

              <div className="mt-6 flex-1 space-y-5">
                {plan.sections.map((section) => (
                  <div key={section.title}>
                    <p className="font-body text-xs font-semibold uppercase tracking-wide text-neutral-midnight/40">
                      {section.title}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 font-body text-sm text-neutral-midnight/80"
                        >
                          <span className="mt-0.5 text-crimson" aria-hidden>
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-neutral-midnight/40">
                    Roll Film
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.rollFilm.map((roll) => (
                      <span
                        key={roll}
                        className="rounded-full bg-neutral-slate/40 px-2.5 py-1 font-body text-xs font-medium text-neutral-midnight/70"
                      >
                        {roll}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link href={plan.href} className="mt-6">
                <Button variant={plan.highlighted ? "primary" : "secondary"} className="w-full">
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
