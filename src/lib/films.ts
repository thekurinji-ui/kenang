// Kenang Kurinji Blueprint v2.0 — Volume 5: Kenang Camera > Film Collection
//
// Setiap film memakai LUT 3D (.cube, dikonversi ke PNG strip) dari paket
// SparkleStock "Disposable Camera" untuk color grading, diterapkan lewat
// WebGL (lihat `lib/webgl-lut.ts`). `lutUrl` dipakai baik untuk live preview
// (elemen <canvas> di viewfinder) maupun saat capture, supaya hasil jepretan
// konsisten 1:1 dengan yang dilihat guest.
//
// `grain` dan `vignette` tetap diterapkan secara terpisah di atas hasil LUT
// (lihat `hooks/use-camera.ts`) karena LUT hanya mengubah warna, bukan tekstur.

export type FilmId =
  | "snap-01"
  | "snap-02"
  | "road-trip-01"
  | "road-trip-02"
  | "iso800-01"
  | "iso800-02"
  | "summer-01"
  | "summer-02";

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
  },
];

export function getFilmById(id: string): FilmPreset {
  return FILM_COLLECTION.find((f) => f.id === id) ?? FILM_COLLECTION[0];
}

export const SHOT_COUNT_OPTIONS = [12, 24, 27, 36, null] as const; // null = Unlimited
