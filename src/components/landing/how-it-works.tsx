const STEPS = [
  {
    number: "01",
    title: "Buat Event",
    description:
      "Daftar dan buat event dalam hitungan detik — pernikahan, ulang tahun, gathering, apa saja.",
  },
  {
    number: "02",
    title: "Sebar QR Code",
    description:
      "Cetak atau tampilkan QR di venue. Tamu tinggal scan lewat kamera HP, tanpa install apapun.",
  },
  {
    number: "03",
    title: "Tamu Jepret Momen",
    description:
      "Setiap tamu dapat roll film digital dengan pilihan filter analog dan batas jepretan seperti kamera asli.",
  },
  {
    number: "04",
    title: "Kenangan Terkumpul",
    description:
      "Semua foto otomatis masuk ke galeri event kamu — siap dilihat, difavoritkan, dan diunduh.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="cara-kerja" className="bg-neutral-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Cara Kerjanya
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Dari QR code sampai galeri kenangan, hanya butuh empat langkah sederhana.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <span className="font-heading text-4xl font-semibold text-crimson-100">
                {step.number}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-neutral-midnight">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-neutral-midnight/70">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
