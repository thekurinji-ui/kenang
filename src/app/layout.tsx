import type { Metadata, Viewport } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Kenang Kurinji — Scan. Jepret. Kenang.",
  description:
    "Web-Based Disposable Camera. Setiap tamu punya sudut pandangnya sendiri — Kenang Kurinji menyatukannya menjadi satu kenangan utuh.",
};

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // prevents pinch-zoom from breaking the fullscreen camera UI
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
