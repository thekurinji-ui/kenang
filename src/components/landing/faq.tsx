import Link from "next/link";

// Homepage Blueprint v3.3 — Section 14 (FAQ)
// Versi ringkas untuk homepage. Daftar lengkap ada di halaman /faq.
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
    q: "Berapa jatah foto yang bisa diambil setiap tamu?",
    a: "Tergantung pengaturan host. Host bisa memilih jumlah jepretan roll film — 5, 12, 24, 39, unlimited, atau custom.",
  },
  {
    q: "Apa perbedaan tiap paket?",
    a: "Kincai gratis untuk mencoba, Kurinji cocok untuk acara personal, Gunung Tujuh membuka Film Collection premium dan fitur AI, dan Gunung Kerinci untuk vendor/enterprise dengan kebutuhan custom.",
  },
  {
    q: "Bisa unduh semua foto sekaligus?",
    a: "Bisa. Host dapat mengunduh seluruh galeri event dalam satu file ZIP dari halaman dashboard.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="bg-neutral-white px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Belum ketemu jawabannya? Hubungi kami langsung.
          </p>
        </div>

        <div className="mt-12 divide-y divide-neutral-slate">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-medium text-neutral-midnight">
                {item.q}
                <span className="ml-4 shrink-0 text-neutral-midnight/40 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-body text-sm leading-relaxed text-neutral-midnight/60">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="font-body text-sm font-medium text-crimson transition-colors hover:text-crimson-600"
          >
            Lihat semua pertanyaan →
          </Link>
        </div>
      </div>
    </section>
  );
}
