// Kenang Kurinji v2.1 — Subscription & Roll Film Blueprint
// Satu sumber kebenaran untuk harga, limit, dan fitur tiap plan.
// Jangan hardcode harga/limit di tempat lain — import dari sini.

export type PlanId = "KINCAI" | "KURINJI" | "GUNUNG_TUJUH" | "GUNUNG_KERINCI";

export type RollFilmOption = 5 | 12 | 24 | 39 | "UNLIMITED" | "CUSTOM";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Harga dalam Rupiah. `null` = custom/hubungi sales (tidak bisa checkout via Midtrans). */
  price: number | null;
  priceLabel: string;
  /** Masa aktif plan dalam hari sejak diaktifkan. `null` = tanpa batas waktu. */
  activeDays: number | null;
  limits: {
    /** `null` = unlimited */
    maxEvents: number | null;
    maxGuests: number | null;
    maxPhotos: number | null;
    maxVideos: number | null;
  };
  watermark: boolean;
  rollFilmOptions: RollFilmOption[];
  features: string[];
}

export const PLAN_LIMITS: Record<PlanId, PlanConfig> = {
  KINCAI: {
    id: "KINCAI",
    name: "Kincai",
    price: 0,
    priceLabel: "Gratis",
    activeDays: 30,
    limits: { maxEvents: 1, maxGuests: 10, maxPhotos: 100, maxVideos: 0 },
    watermark: true,
    rollFilmOptions: [5],
    features: [
      "QR Upload",
      "Disposable Camera",
      "Gallery Online",
      "Download Foto Individu",
      "Watermark Kenang Kurinji",
    ],
  },
  KURINJI: {
    id: "KURINJI",
    name: "Kurinji",
    price: 79_000,
    priceLabel: "Rp79.000 / Event",
    activeDays: 365,
    limits: { maxEvents: 1, maxGuests: 100, maxPhotos: 4_000, maxVideos: 500 },
    watermark: false,
    rollFilmOptions: [5, 12, 24, 39],
    features: [
      "Tanpa Watermark",
      "Guest Book Digital",
      "Reveal Gallery",
      "Download ZIP",
      "Custom Cover Event",
      "Prioritas Upload",
    ],
  },
  GUNUNG_TUJUH: {
    id: "GUNUNG_TUJUH",
    name: "Gunung Tujuh",
    price: 199_000,
    priceLabel: "Rp199.000 / Event",
    activeDays: 365,
    limits: { maxEvents: 1, maxGuests: 300, maxPhotos: 12_000, maxVideos: 2_000 },
    watermark: false,
    rollFilmOptions: [5, 12, 24, 39, "UNLIMITED", "CUSTOM"],
    features: [
      "Film Collection (8 preset LUT)",
      "Preview Filter",
      "AI Best Shot",
      "AI Blur Detection",
      "Analytics Dashboard",
      "Multi QR",
      "Album Privat",
      "Password Gallery",
      "Custom Branding",
    ],
  },
  GUNUNG_KERINCI: {
    id: "GUNUNG_KERINCI",
    name: "Gunung Kerinci",
    price: null,
    priceLabel: "Custom",
    activeDays: null,
    limits: { maxEvents: null, maxGuests: null, maxPhotos: null, maxVideos: null },
    watermark: false,
    rollFilmOptions: ["UNLIMITED", "CUSTOM"],
    features: [
      "Unlimited Event",
      "Unlimited Tamu",
      "Unlimited Storage (Fair Use)",
      "White Label",
      "Custom Domain",
      "API Access",
      "Multi User",
      "Team Management",
      "Dedicated Account Manager",
      "Priority Support",
      "Custom Feature Request",
      "Semua LUT + Import LUT (.cube) + Custom Preset",
    ],
  },
};

/** Plan yang bisa dibeli langsung lewat Midtrans checkout. */
export const CHECKOUT_PLANS = ["KURINJI", "GUNUNG_TUJUH"] as const;
export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlan(value: unknown): value is CheckoutPlan {
  return (CHECKOUT_PLANS as readonly string[]).includes(value as string);
}

/** Hitung tanggal expiresAt dari plan yang baru dibeli/diaktifkan. */
export function computeExpiresAt(plan: PlanId, from: Date = new Date()): Date | null {
  const activeDays = PLAN_LIMITS[plan].activeDays;
  if (activeDays === null) return null;
  const expires = new Date(from);
  expires.setDate(expires.getDate() + activeDays);
  return expires;
}
