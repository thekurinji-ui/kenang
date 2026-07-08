// Kenang Kurinji Blueprint v2.0/v2.1 — Volume 5: Kenang Camera > Film Collection
//
// Setiap film memakai LUT 3D (.cube, dikonversi ke PNG strip lewat
// `scripts/convert-lut.mjs`) untuk color grading, diterapkan lewat WebGL
// (lihat `lib/webgl-lut.ts`). `lutUrl` dipakai baik untuk live preview
// (elemen <canvas> di viewfinder) maupun saat capture, supaya hasil jepretan
// konsisten 1:1 dengan yang dilihat guest.
//
// `grain` dan `vignette` tetap diterapkan secara terpisah di atas hasil LUT
// (lihat `hooks/use-camera.ts`) karena LUT hanya mengubah warna, bukan tekstur.
//
// --- Tier (Blueprint v2.1 — Subscription & Roll Film) ---------------------
// "STANDARD" (8 film SparkleStock Disposable Camera) tersedia untuk semua
// plan, termasuk Kincai (gratis). "PREMIUM" (Film Collection eksklusif —
// varian Fuji/Kodak print-stock) HANYA tersedia untuk plan Gunung Tujuh ke
// atas, sesuai Blueprint v2.1. Jangan filter tier ini di komponen UI secara
// manual — selalu pakai `getFilmsForPlan(plan)` dari `@/lib/plans`.

export type FilmTier = "STANDARD" | "PREMIUM";

export type FilmId =
  // Standard — semua plan
  | "snap-01"
  | "snap-02"
  | "road-trip-01"
  | "road-trip-02"
  | "iso800-01"
  | "iso800-02"
  | "summer-01"
  | "summer-02"
  // Premium — eksklusif Gunung Tujuh ke atas
  | "fuji-eterna-250d-3510"
  | "fuji-eterna-250d-2395"
  | "fuji-f125-2393"
  | "fuji-f125-2395"
  | "fuji-reala-500d"
  | "kodak-5218-2383"
  | "kodak-5218-2395"
  | "kodak-5295"
  | "filmstock-50"
  | "late-sunset"
  | "night-from-day";

export interface FilmPreset {
  id: FilmId;
  name: string;
  inspiredBy: string;
  description: string;
  swatch: string; // representative color for the film selector chip
  lutUrl: string; // path to the LUT strip PNG (public/luts/*.png)
  lutSize: number; // resolution of the source .cube (e.g. 32 = 32x32x32)
  grain: number; // 0–1 overlay opacity for film grain texture
  vignette: boolean;
  tier: FilmTier;
  /** Foto preview asli (public/film-collection/*.jpg), hasil grading LUT
   *  ini diterapkan ke satu foto referensi lewat
   *  scripts/generate-standard-previews.py — dipakai di homepage (Film
   *  Strip Memories), bukan di kamera live (itu pakai lutUrl + WebGL). */
  previewImage?: string;
}

export const FILM_COLLECTION: FilmPreset[] = [
  {
    id: "snap-01",
    name: "Snap 01",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Warna klasik kamera sekali-pakai, kontras hangat dan lembut.",
    swatch: "#E4A64B",
    lutUrl: "/luts/snap-01.png",
    lutSize: 32,
    grain: 0.12,
    vignette: true,
    tier: "STANDARD",
    previewImage: "/film-collection/snap-01.jpg",
  },
  {
    id: "snap-02",
    name: "Snap 02",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Variasi Snap yang lebih pudar, nuansa nostalgia album lama.",
    swatch: "#D9B48F",
    lutUrl: "/luts/snap-02.png",
    lutSize: 32,
    grain: 0.14,
    vignette: true,
    tier: "STANDARD",
    previewImage: "/film-collection/snap-02.jpg",
  },
  {
    id: "road-trip-01",
    name: "Road Trip 01",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Tone cerah dan segar, cocok untuk momen di luar ruangan.",
    swatch: "#6FA8DC",
    lutUrl: "/luts/road-trip-01.png",
    lutSize: 32,
    grain: 0.08,
    vignette: false,
    tier: "STANDARD",
    previewImage: "/film-collection/road-trip-01.jpg",
  },
  {
    id: "road-trip-02",
    name: "Road Trip 02",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Kontras lebih tegas dengan sedikit sentuhan hijau-teal.",
    swatch: "#4E9E8F",
    lutUrl: "/luts/road-trip-02.png",
    lutSize: 32,
    grain: 0.09,
    vignette: false,
    tier: "STANDARD",
    previewImage: "/film-collection/road-trip-02.jpg",
  },
  {
    id: "iso800-01",
    name: "ISO800 01",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Grain tebal ala film ISO tinggi, cocok untuk suasana temaram.",
    swatch: "#8A8A8A",
    lutUrl: "/luts/iso800-01.png",
    lutSize: 32,
    grain: 0.22,
    vignette: true,
    tier: "STANDARD",
    previewImage: "/film-collection/iso800-01.jpg",
  },
  {
    id: "iso800-02",
    name: "ISO800 02",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Versi lebih dingin dari ISO800, tekstur grain khas malam hari.",
    swatch: "#5B6B7A",
    lutUrl: "/luts/iso800-02.png",
    lutSize: 32,
    grain: 0.24,
    vignette: true,
    tier: "STANDARD",
    previewImage: "/film-collection/iso800-02.jpg",
  },
  {
    id: "summer-01",
    name: "Summer 01",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Saturasi tinggi dan ceria, warna hidup ala musim panas.",
    swatch: "#F2C14E",
    lutUrl: "/luts/summer-01.png",
    lutSize: 32,
    grain: 0.06,
    vignette: false,
    tier: "STANDARD",
    previewImage: "/film-collection/summer-01.jpg",
  },
  {
    id: "summer-02",
    name: "Summer 02",
    inspiredBy: "SparkleStock Disposable Camera",
    description: "Summer dengan highlight lebih lembut dan warm skin tone.",
    swatch: "#EFA98D",
    lutUrl: "/luts/summer-02.png",
    lutSize: 32,
    grain: 0.07,
    vignette: true,
    tier: "STANDARD",
    previewImage: "/film-collection/summer-02.jpg",
  },
];

// Film Collection premium (Blueprint v2.1 — eksklusif Gunung Tujuh ke atas).
// LUT asli (.cube, LUT_3D_SIZE 64) dikonversi lewat `scripts/convert-lut.mjs`.
// Tiga film (Fuji Eterna 250D, Fuji F125, Kodak 5218) tersedia dalam 2 varian
// print-stock berbeda — keduanya disertakan sebagai preset terpisah supaya
// host/tamu bisa memilih karakter warna yang paling cocok.
export const PREMIUM_FILM_COLLECTION: FilmPreset[] = [
  {
    id: "fuji-eterna-250d-3510",
    name: "Eterna Soft",
    inspiredBy: "Fuji Eterna 250D (print Fuji 3510)",
    description: "Warna sinematik lembut dengan highlight hangat khas print Fuji.",
    swatch: "#9E95A3",
    lutUrl: "/luts/fuji-eterna-250d-3510.png",
    lutSize: 64,
    grain: 0.1,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "fuji-eterna-250d-2395",
    name: "Eterna Neutral",
    inspiredBy: "Fuji Eterna 250D (print Kodak 2395)",
    description: "Karakter Eterna 250D dengan kontras print Kodak, lebih netral.",
    swatch: "#AF9E95",
    lutUrl: "/luts/fuji-eterna-250d-2395.png",
    lutSize: 64,
    grain: 0.1,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "fuji-f125-2393",
    name: "Daybreak",
    inspiredBy: "Fuji F125 (print Kodak 2393)",
    description: "Tone hangat seimbang, cocok untuk potret siang hari.",
    swatch: "#AA9182",
    lutUrl: "/luts/fuji-f125-2393.png",
    lutSize: 64,
    grain: 0.1,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "fuji-f125-2395",
    name: "Daybreak Soft",
    inspiredBy: "Fuji F125 (print Kodak 2395)",
    description: "Varian F125 dengan skin tone lebih lembut dan shadow lebih dalam.",
    swatch: "#AA958E",
    lutUrl: "/luts/fuji-f125-2395.png",
    lutSize: 64,
    grain: 0.1,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "fuji-reala-500d",
    name: "Reala Blush",
    inspiredBy: "Fuji Reala 500D (print Kodak 2393)",
    description: "Saturasi natural dengan sedikit sentuhan merah muda pada skin tone.",
    swatch: "#AC9587",
    lutUrl: "/luts/fuji-reala-500d.png",
    lutSize: 64,
    grain: 0.13,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "kodak-5218-2383",
    name: "Vision Classic",
    inspiredBy: "Kodak Vision3 500T 5218 (print Kodak 2383)",
    description: "Klasik sinematik Kodak, kontras kuat dengan shadow kehijauan.",
    swatch: "#AFA59A",
    lutUrl: "/luts/kodak-5218-2383.png",
    lutSize: 64,
    grain: 0.15,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "kodak-5218-2395",
    name: "Vision Neutral",
    inspiredBy: "Kodak Vision3 500T 5218 (print Kodak 2395)",
    description: "Varian 5218 yang lebih netral dan lembut di highlight.",
    swatch: "#AEA19C",
    lutUrl: "/luts/kodak-5218-2395.png",
    lutSize: 64,
    grain: 0.15,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "kodak-5295",
    name: "Amber Glow",
    inspiredBy: "Kodak Vision2 500T 5295 (print Fuji 3510)",
    description: "Grain halus dengan warna hangat, cocok untuk suasana intim indoor.",
    swatch: "#AF9E90",
    lutUrl: "/luts/kodak-5295.png",
    lutSize: 64,
    grain: 0.16,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "filmstock-50",
    name: "Clarity 50",
    inspiredBy: "Filmstock 50",
    description: "ISO rendah, warna bersih dan tajam dengan grain minimal.",
    swatch: "#D4C3A5",
    lutUrl: "/luts/filmstock-50.png",
    lutSize: 64,
    grain: 0.05,
    vignette: false,
    tier: "PREMIUM",
  },
  {
    id: "late-sunset",
    name: "Late Sunset",
    inspiredBy: "Late Sunset",
    description: "Gradasi warna senja keunguan-merah muda, dramatis untuk golden hour.",
    swatch: "#744857",
    lutUrl: "/luts/late-sunset.png",
    lutSize: 64,
    grain: 0.1,
    vignette: true,
    tier: "PREMIUM",
  },
  {
    id: "night-from-day",
    name: "Night From Day",
    inspiredBy: "Night From Day",
    description: "Efek day-for-night sinematik, tone biru gelap dramatis.",
    swatch: "#2F364D",
    lutUrl: "/luts/night-from-day.png",
    lutSize: 64,
    grain: 0.18,
    vignette: true,
    tier: "PREMIUM",
  },
];

export const ALL_FILMS: FilmPreset[] = [...FILM_COLLECTION, ...PREMIUM_FILM_COLLECTION];

export function getFilmById(id: string): FilmPreset {
  return ALL_FILMS.find((f) => f.id === id) ?? FILM_COLLECTION[0];
}

// Opsi jumlah jepretan (Roll Film) TIDAK lagi didefinisikan di sini secara
// hardcoded — daftar itu harus mengikuti plan host (Kincai/Kurinji/Gunung
// Tujuh/Gunung Kerinci punya opsi berbeda, lihat Blueprint v2.1). Pakai
// `getRollFilmPresets(plan)` dari `@/lib/plans` di komponen manapun yang
// butuh daftar ini.
