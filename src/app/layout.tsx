import type { Metadata, Viewport } from "next";
import { Fraunces, Poppins, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kenang.kurinji.asia"),

  title: {
    default: "Kenang Kurinji — Scan. Jepret. Kenang.",
    template: "%s | Kenang Kurinji",
  },

  description:
    "Web-Based Disposable Camera. Setiap tamu punya sudut pandangnya sendiri — Kenang Kurinji menyatukannya menjadi satu kenangan utuh.",

  keywords: [
    "Kenang Kurinji",
    "Disposable Camera",
    "Digital Disposable Camera",
    "Wedding Camera",
    "Wedding Gallery",
    "Guest Camera",
    "Photo Sharing",
    "Event Photography",
  ],

  openGraph: {
    title: "Kenang Kurinji — Scan. Jepret. Kenang.",
    description:
      "Web-Based Disposable Camera untuk pernikahan dan berbagai acara.",
    url: "https://kenang.kurinji.asia",
    siteName: "Kenang Kurinji",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kenang Kurinji",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kenang Kurinji — Scan. Jepret. Kenang.",
    description:
      "Web-Based Disposable Camera untuk pernikahan dan berbagai acara.",
    images: ["/opengraph-image"],
  },

  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">
        <JsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
        }
