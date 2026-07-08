export interface FilmLutShowcase {
  slug: string;
  name: string;
  character: string;
  image: string;
}

// Homepage Blueprint v3.3 — Section 10 (Film Collection)
// Preview foto pakai satu foto asli (izin dari pemiliknya) yang di-grading
// ulang untuk tiap karakter film — bukan 8 foto beda, biar kelihatan jelas
// bedanya karakter warna tiap LUT dari sumber yang sama persis.
export const FILM_COLLECTION: FilmLutShowcase[] = [
  {
    slug: "fuji-eterna-250d",
    name: "Fuji Eterna 250D",
    character: "Sinematik, lembut, warna redup elegan",
    image: "/film-collection/fuji-eterna-250d.jpg",
  },
  {
    slug: "fuji-f125",
    name: "Fuji F125",
    character: "Cerah, bersih, natural",
    image: "/film-collection/fuji-f125.jpg",
  },
  {
    slug: "fuji-reala-500d",
    name: "Fuji Reala 500D",
    character: "Warna kulit hangat, kontras hidup",
    image: "/film-collection/fuji-reala-500d.jpg",
  },
  {
    slug: "kodak-5218",
    name: "Kodak 5218",
    character: "Klasik, grain kental, highlight keemasan",
    image: "/film-collection/kodak-5218.jpg",
  },
  {
    slug: "kodak-5295",
    name: "Kodak 5295",
    character: "Kontras tegas, saturasi tinggi, gritty",
    image: "/film-collection/kodak-5295.jpg",
  },
  {
    slug: "filmstock-50",
    name: "Filmstock 50",
    character: "Grain halus, netral, tajam",
    image: "/film-collection/filmstock-50.jpg",
  },
  {
    slug: "late-sunset",
    name: "Late Sunset",
    character: "Golden hour, hangat keemasan",
    image: "/film-collection/late-sunset.jpg",
  },
  {
    slug: "night-from-day",
    name: "Night From Day",
    character: "Day-for-night, sejuk misterius",
    image: "/film-collection/night-from-day.jpg",
  },
];
