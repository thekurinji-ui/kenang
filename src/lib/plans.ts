// Kenang Kurinji v2.1 — Subscription & Roll Film Blueprint
// Satu sumber kebenaran untuk harga, limit, dan fitur tiap plan.
// Jangan hardcode harga/limit di tempat lain — import dari sini.

import { FILM_COLLECTION, PREMIUM_FILM_COLLECTION, type FilmPreset } from "@/lib/films";

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
      "Film Collection (11 preset LUT eksklusif)",
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

/**
 * Alias semantik dari `computeExpiresAt`, dipakai saat men-snapshot masa aktif
 * sebuah Event (bukan Subscription user). Logikanya identik: activeDays plan
 * dihitung dari `from` (createdAt event).
 */
export const computeActiveUntil = computeExpiresAt;

/**
 * Plan yang BENAR-BENAR berlaku untuk user saat ini. Kalau subscription-nya
 * sudah lewat masa aktif (expiresAt < sekarang) atau statusnya bukan ACTIVE,
 * user dianggap kembali ke Kincai (gratis) — supaya limit/fitur premium tidak
 * "nyangkut" selamanya setelah subscription berakhir.
 */
export function getEffectivePlan(
  subscription: { plan: PlanId; status: string; expiresAt: Date | null } | null | undefined
): PlanId {
  if (!subscription) return "KINCAI";
  if (subscription.status !== "ACTIVE") return "KINCAI";
  if (subscription.expiresAt && subscription.expiresAt.getTime() < Date.now()) return "KINCAI";
  return subscription.plan;
}

/**
 * Validasi jumlah jepretan (Roll Film) yang dipilih host terhadap opsi yang
 * diperbolehkan plan-nya. `shotLimit === null` berarti host memilih Unlimited.
 */
export function isRollFilmOptionAllowed(plan: PlanId, shotLimit: number | null): boolean {
  const options = PLAN_LIMITS[plan].rollFilmOptions;
  if (shotLimit === null) return options.includes("UNLIMITED");
  if (options.includes(shotLimit as RollFilmOption)) return true;
  // Angka di luar preset baku (5/12/24/39) hanya boleh kalau plan punya opsi
  // "Custom" (Gunung Tujuh ke atas).
  return options.includes("CUSTOM") && Number.isInteger(shotLimit) && shotLimit > 0;
}

/**
 * Opsi Roll Film yang ditampilkan sebagai preset chip di UI (create/edit
 * event form), diturunkan dari `rollFilmOptions` plan — jangan hardcode
 * daftar angka di komponen manapun, selalu ambil dari sini supaya otomatis
 * sinkron kalau blueprint plan berubah.
 */
export function getRollFilmPresets(
  plan: PlanId
): { presets: (number | null)[]; allowCustom: boolean } {
  const options = PLAN_LIMITS[plan].rollFilmOptions;
  const presets = options
    .filter((o): o is 5 | 12 | 24 | 39 | "UNLIMITED" => o !== "CUSTOM")
    .map((o) => (o === "UNLIMITED" ? null : o));
  return { presets, allowCustom: options.includes("CUSTOM") };
}

/** Default jepretan yang dipilihkan saat form pertama dibuka: 24 ("Classic",
 * per terminologi blueprint) kalau plan mengizinkannya, kalau tidak jatuh
 * ke opsi pertama yang tersedia untuk plan itu. */
export function getDefaultRollFilmOption(plan: PlanId): number | null {
  const { presets } = getRollFilmPresets(plan);
  if (presets.includes(24)) return 24;
  return presets[0] ?? null;
}

/** Plan yang punya akses ke Film Collection premium (LUT eksklusif Fuji/Kodak). */
const PREMIUM_FILM_PLANS: PlanId[] = ["GUNUNG_TUJUH", "GUNUNG_KERINCI"];

export function hasPremiumFilmAccess(plan: PlanId): boolean {
  return PREMIUM_FILM_PLANS.includes(plan);
}

/**
 * Plan yang punya akses ke fitur AI v3.0 (Best Shot, Story, Smart Gallery).
 * Sama seperti Film Collection premium — sesuai daftar fitur Gunung Tujuh di
 * atas ("AI Best Shot", "AI Blur Detection", dst), jadi satu tier yang sama
 * dipakai untuk gating supaya tidak ada dua sumber kebenaran yang beda.
 */
export function hasAIAccess(plan: PlanId): boolean {
  return PREMIUM_FILM_PLANS.includes(plan);
}

/**
 * Daftar film yang boleh dipakai guest di Kenang Camera untuk plan tertentu.
 * Kincai/Kurinji hanya dapat 8 film "STANDARD" (SparkleStock). Gunung Tujuh
 * ke atas dapat 8 STANDARD + Film Collection "PREMIUM" (eksklusif, Blueprint
 * v2.1). Selalu pakai fungsi ini di UI — jangan filter tier film secara
 * manual supaya tidak ada tempat yang lupa nge-gate saat plan baru muncul.
 */
export function getFilmsForPlan(plan: PlanId): FilmPreset[] {
  return hasPremiumFilmAccess(plan)
    ? [...FILM_COLLECTION, ...PREMIUM_FILM_COLLECTION]
    : [...FILM_COLLECTION];
}
