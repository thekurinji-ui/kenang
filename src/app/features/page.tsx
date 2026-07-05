import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Camera, QrCode, Palette, Images, Sparkles, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Kamera Web, Tanpa Install App",
    description:
      "Tamu langsung buka kamera dari browser HP mereka — cukup scan QR code, gak perlu download apapun.",
  },
  {
    icon: QrCode,
    title: "Akses Instan Lewat QR Code",
    description:
      "Setiap event punya QR code unik. Tempel di meja, undangan, atau banner — tamu tinggal scan dan langsung mulai memotret.",
  },
  {
    icon: Palette,
    title: "Film Preset Estetik",
    description:
      "Pilihan gaya film klasik ala kamera disposable — dari warm vintage sampai hitam putih dramatis, tanpa perlu edit manual.",
  },
  {
    icon: Images,
    title: "Gallery Real-time",
    description:
      "Semua foto dari tamu terkumpul otomatis di satu galeri bersama. Bisa langsung terlihat atau baru terbuka setelah acara selesai — kamu yang atur.",
  },
  {
    icon: Sparkles,
    title: "AI Highlight & Deteksi Blur",
    description:
      "Sistem otomatis menandai foto-foto terbaik dan menyaring foto yang blur atau duplikat, jadi kamu gak perlu sortir ratusan foto manual.",
  },
  {
    icon: ShieldCheck,
    title: "Kontrol Penuh untuk Host",
    description:
      "Atur batas jepretan per tamu, blokir tamu yang nakal, unduh semua foto sekaligus, dan pantau statistik event secara real-time.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Semua yang Kamu Butuh untuk Kamera Disposable Digital
          </h1>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Kenang Kurinji menggabungkan nostalgia kamera disposable dengan kemudahan teknologi
            web modern.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-neutral-slate bg-neutral-white p-6 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-crimson-50 text-crimson">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-neutral-midnight">
                  {feature.title}
                </h3>
                <p className="mt-2 font-body text-sm text-neutral-midnight/60">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
