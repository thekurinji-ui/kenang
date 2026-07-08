import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

const FAQS = [
  {
    q: "Apa itu Kenang Kurinji?",
    a: "Kenang Kurinji adalah kamera disposable digital berbasis web. Tamu event bisa memotret momen lewat browser HP mereka tanpa install aplikasi, dan semua hasilnya terkumpul di satu galeri bersama.",
  },
  {
    q: "Apakah tamu harus install aplikasi?",
    a: "Tidak. Tamu cukup scan QR code event, lalu kamera langsung terbuka di browser. Tidak ada proses download atau instalasi sama sekali.",
  },
  {
    q: "Apa bedanya reveal mode Instant dan Setelah Acara Selesai?",
    a: "Instant berarti foto tamu langsung muncul di galeri begitu diunggah. Setelah Acara Selesai berarti semua foto disembunyikan dulu dan baru terlihat serentak setelah host menutup event — cocok untuk momen 'reveal' yang lebih seru.",
  },
  {
    q: "Berapa jatah foto yang bisa diambil setiap tamu?",
    a: "Tergantung pengaturan host. Host bisa memilih batas jepretan tertentu (misal 5, 10, 24) atau membiarkannya unlimited.",
  },
  {
    q: "Apa perbedaan paket Kincai, Kurinji, Gunung Tujuh, dan Gunung Kerinci?",
    a: "Kincai gratis untuk coba-coba di acara kecil dengan watermark dan kuota terbatas. Kurinji menghilangkan watermark, menambah kuota foto/video, dan membuka guest book digital. Gunung Tujuh membuka Film Collection premium, fitur AI (Best Shot, Blur Detection), analytics dashboard, dan multi QR. Gunung Kerinci dirancang untuk vendor/EO dengan event tanpa batas, white label, dan API access.",
  },
  {
    q: "Bisa unduh semua foto sekaligus?",
    a: "Bisa. Host dapat mengunduh seluruh galeri event dalam satu file ZIP dari halaman dashboard.",
  },
  {
    q: "Apakah foto tamu aman dan privat?",
    a: "Foto hanya bisa diakses oleh host dan tamu yang memiliki link/QR event tersebut. Host juga bisa memblokir tamu tertentu atau menghapus foto yang tidak sesuai.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Belum ketemu jawabannya? Hubungi kami langsung.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl divide-y divide-neutral-slate">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base font-medium text-neutral-midnight">
                {item.q}
                <span className="ml-4 text-neutral-midnight/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-body text-sm text-neutral-midnight/60">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
