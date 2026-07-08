import { MessageCircle, ImageOff, Users } from "lucide-react";

// Homepage Blueprint v3.3 — Section 7 (Problem)
const PROBLEMS = [
  {
    icon: MessageCircle,
    title: "Foto Tercecer di WhatsApp",
    description:
      "Setiap tamu simpan hasil jepretannya sendiri-sendiri, kekompres pula. Butuh usaha ekstra buat kumpulinnya jadi satu.",
  },
  {
    icon: ImageOff,
    title: "Momen yang Tidak Tertangkap",
    description:
      "Fotografer cuma satu, momennya ratusan. Banyak hal kecil yang justru paling berkesan malah luput dari kamera utama.",
  },
  {
    icon: Users,
    title: "Sulit Mengumpulkan dari Semua Tamu",
    description:
      "Minta foto satu-satu ke tamu setelah acara selesai? Hampir selalu berakhir cuma sebagian kecil yang benar-benar terkumpul.",
  },
];

export function LandingProblem() {
  return (
    <section className="bg-neutral-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Yang Sering Terjadi Setiap Acara
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div key={problem.title} className="text-center sm:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-crimson-50 text-crimson sm:mx-0">
                <problem.icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-neutral-midnight">
                {problem.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-neutral-midnight/70">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
