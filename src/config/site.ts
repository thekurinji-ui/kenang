export const siteConfig = {
  name: "Kenang Kurinji",
  legalName: "PT Kurinji Virtual Nusantara",

  url: "https://kenang.kurinji.asia",

  description:
    "Disposable camera digital untuk mengabadikan momen spesial. Biarkan setiap tamu mengambil foto, lalu simpan semuanya dalam satu galeri yang bisa dikenang selamanya.",

  keywords: [
    "Kenang Kurinji",
    "Disposable Camera",
    "Wedding Camera",
    "Wedding Gallery",
    "Digital Camera",
    "Photo Sharing",
    "Wedding Guest Camera",
    "Event Photography",
  ],

  email: {
    hello: "halo@kurinji.asia",
    noreply: "noreply@kurinji.asia",
  },

  socials: {
    instagram: "https://instagram.com/kenangkurinji",
    tiktok: "https://tiktok.com/@kenangkurinji",
    threads: "https://threads.net/@kenangkurinji",
  },
} as const;

export type SiteConfig = typeof siteConfig;
