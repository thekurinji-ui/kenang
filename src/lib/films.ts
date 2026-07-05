// Kenang Kurinji Blueprint v2.0 — Volume 5: Kenang Camera > Film Collection
//
// Setiap film punya karakter visual yang terinspirasi dari film kamera analog
// aslinya. `cssFilter` dipakai untuk live preview (elemen <video>), dan
// `canvasFilter` (format sama, dipakai via ctx.filter) diterapkan saat capture
// supaya hasil jepretan konsisten dengan yang dilihat di viewfinder.

export type FilmId =
  | "sunny-roll"
  | "daylight-classic"
  | "golden-portrait"
  | "vivid-bloom"
  | "silver-grain"
  | "neon-night";

export interface FilmPreset {
  id: FilmId;
  name: string;
  inspiredBy: string;
  description: string;
  swatch: string; // representative color for the film selector chip
  filter: string; // CSS/canvas filter string
  grain: number; // 0–1 overlay opacity for film grain texture
  vignette: boolean;
}

export const FILM_COLLECTION: FilmPreset[] = [
  {
    id: "sunny-roll",
    name: "Sunny Roll",
    inspiredBy: "Kodak FunSaver",
    description: "Hangat, sedikit overexposed — nostalgia foto liburan.",
    swatch: "#F5A609",
    filter: "saturate(1.15) contrast(1.05) brightness(1.08) sepia(0.08)",
    grain: 0.12,
    vignette: true,
  },
  {
    id: "daylight-classic",
    name: "Daylight Classic",
    inspiredBy: "Fujifilm QuickSnap",
    description: "Tajam, sedikit dingin dan segar seperti siang hari.",
    swatch: "#6FA8DC",
    filter: "saturate(1.05) contrast(1.08) brightness(1.02) hue-rotate(-2deg)",
    grain: 0.08,
    vignette: false,
  },
  {
    id: "golden-portrait",
    name: "Golden Portrait",
    inspiredBy: "Kodak Portra 400",
    description: "Warna kulit lembut dan hangat, cocok untuk potret.",
    swatch: "#E8B98A",
    filter: "saturate(0.95) contrast(0.95) brightness(1.05) sepia(0.12)",
    grain: 0.1,
    vignette: true,
  },
  {
    id: "vivid-bloom",
    name: "Vivid Bloom",
    inspiredBy: "Kodak Ektar 100",
    description: "Saturasi tinggi, warna hidup dan mencolok.",
    swatch: "#D62828",
    filter: "saturate(1.45) contrast(1.15) brightness(1.0)",
    grain: 0.06,
    vignette: false,
  },
  {
    id: "silver-grain",
    name: "Silver Grain",
    inspiredBy: "Ilford HP5 Plus",
    description: "Hitam putih klasik dengan tekstur grain.",
    swatch: "#8A8A8A",
    filter: "grayscale(1) contrast(1.2) brightness(1.05)",
    grain: 0.22,
    vignette: true,
  },
  {
    id: "neon-night",
    name: "Neon Night",
    inspiredBy: "CineStill 800T",
    description: "Sejuk dengan sentuhan halation — untuk suasana malam.",
    swatch: "#1D4ED8",
    filter: "saturate(1.2) contrast(1.1) brightness(0.95) hue-rotate(6deg)",
    grain: 0.15,
    vignette: true,
  },
];

export function getFilmById(id: string): FilmPreset {
  return FILM_COLLECTION.find((f) => f.id === id) ?? FILM_COLLECTION[0];
}

export const SHOT_COUNT_OPTIONS = [12, 24, 27, 36, null] as const; // null = Unlimited
