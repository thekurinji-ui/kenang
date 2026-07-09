import Link from "next/link";
import {
  Aperture,
  Camera,
  CheckCircle2,
  Globe,
  Images,
  LayoutGrid,
  Mail,
  Mic,
  Music2,
  QrCode,
  Smartphone,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

const MISSIONS = [
  "Menghadirkan pengalaman kamera disposable dalam format digital yang mudah digunakan.",
  "Membantu penyelenggara acara mengumpulkan dokumentasi dari seluruh tamu dalam satu galeri.",
  "Memanfaatkan teknologi secara bijak untuk memperkaya pengalaman tanpa menghilangkan keaslian setiap momen.",
  "Menjaga keamanan, privasi, dan kepemilikan setiap foto pengguna.",
  "Terus menghadirkan inovasi yang membuat setiap acara lebih berkesan.",
];

const FEATURES = [
  { icon: Camera, label: "Kamera Disposable Digital" },
  { icon: QrCode, label: "Akses Kamera melalui QR Code" },
  { icon: Images, label: "Galeri Foto Acara" },
  { icon: Sparkles, label: "AI Best Shot" },
  { icon: Wand2, label: "AI Story" },
  { icon: LayoutGrid, label: "AI Smart Gallery" },
  { icon: Smartphone, label: "Mobile First Experience" },
  { icon: Globe, label: "Tanpa Instalasi Aplikasi" },
];

const ECOSYSTEM = [
  {
    icon: Camera,
    name: "Kenang Kurinji",
    description:
      "Platform dokumentasi acara berbasis QR Code yang menghadirkan pengalaman kamera disposable digital. Tamu cukup memindai QR Code untuk mengambil foto melalui browser tanpa perlu mengunduh aplikasi, dan seluruh dokumentasi akan terkumpul secara otomatis dalam satu galeri acara.",
    highlight: true,
  },
  {
    icon: Mail,
    name: "Selalu Ajak",
    description:
      "Platform undangan digital yang memudahkan pengguna membuat dan membagikan undangan untuk berbagai acara. Dilengkapi dengan RSVP, cerita acara, galeri, buku tamu digital, hingga berbagai fitur interaktif yang membuat setiap undangan terasa lebih personal.",
    highlight: false,
  },
  {
    icon: Aperture,
    name: "Kurinji Photo",
    description:
      "Platform perangkat lunak untuk bisnis photobooth modern. Kurinji Photo membantu pelaku usaha photobooth mengelola sesi foto, kamera, template, hasil cetak maupun digital, serta pengalaman pelanggan melalui satu sistem yang praktis dan profesional.",
    highlight: false,
  },
  {
    icon: Mic,
    name: "Kurinji Hub",
    description:
      "Platform manajemen talenta dan agensi live streaming yang membantu kreator mengembangkan karier melalui pelatihan, pendampingan, manajemen profesional, serta peluang kolaborasi dengan berbagai platform dan mitra.",
    highlight: false,
  },
  {
    icon: Music2,
    name: "Kurinji Music",
    description:
      "Label musik dan manajemen artis yang mendukung penyanyi, penulis lagu, produser musik, dan talenta kreatif dalam proses produksi, distribusi, promosi, hingga pengembangan karier di industri musik.",
    highlight: false,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      {/* Intro */}
      <section className="px-6 pb-16 pt-20 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Tentang Kenang Kurinji
          </h1>

          <p className="mt-6 font-body leading-relaxed text-neutral-midnight/70">
            Setiap momen berharga hanya terjadi sekali. Tawa yang pecah tanpa
            rencana, pelukan hangat, air mata bahagia, hingga candaan kecil di
            sudut ruangan—semuanya layak dikenang dari berbagai sudut
            pandang.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            <span className="font-medium text-neutral-midnight">
              Kenang Kurinji
            </span>{" "}
            terinspirasi dari{" "}
            <span className="font-medium text-neutral-midnight">
              Neelakurinji
            </span>
            , bunga langka yang mekar setiap 12 tahun sekali di pegunungan.
            Mekarnya menjadi simbol bahwa ada momen dalam hidup yang begitu
            istimewa hingga layak dirayakan dan diabadikan. Dari filosofi
            itulah Kenang Kurinji lahir: membantu setiap orang mengumpulkan
            kenangan yang tidak akan terulang.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Kami percaya bahwa dokumentasi terbaik bukan hanya berasal dari
            fotografer profesional, tetapi juga dari setiap tamu yang hadir.
            Karena itu, Kenang Kurinji menghadirkan kembali pengalaman kamera
            disposable dalam bentuk digital. Cukup pindai QR Code melalui
            browser, tanpa perlu mengunduh aplikasi, lalu abadikan momen dari
            sudut pandang Anda sendiri.
          </p>

          <p className="mt-6 font-heading text-lg italic text-neutral-midnight/80">
            Setiap jepretan menjadi bagian dari satu cerita yang utuh.
          </p>
        </div>
      </section>

      {/* Cerita Kami */}
      <section className="relative overflow-hidden bg-crimson-50/40 px-6 py-20 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-4xl -translate-x-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(214,40,40,0.06),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-center font-heading text-2xl font-semibold text-neutral-midnight md:text-3xl">
            Cerita Kami
          </h2>

          <p className="mt-8 font-body leading-relaxed text-neutral-midnight/70">
            Kenang Kurinji berawal dari sebuah pertanyaan sederhana.
          </p>

          <p className="mt-6 text-center font-heading text-xl italic leading-relaxed text-neutral-midnight/90 md:text-2xl">
            &ldquo;Ke mana perginya semua foto yang diambil oleh para tamu
            setelah sebuah acara berakhir?&rdquo;
          </p>

          <p className="mt-8 font-body leading-relaxed text-neutral-midnight/70">
            Di setiap pernikahan, ulang tahun, gathering, hingga acara
            keluarga, selalu ada puluhan bahkan ratusan momen yang diabadikan
            dari berbagai sudut pandang. Namun, sebagian besar foto tersebut
            tetap tersimpan di galeri ponsel masing-masing, tidak pernah
            terkumpul, dan perlahan terlupakan.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Padahal, setiap tamu memiliki cerita yang berbeda. Ada yang
            mengabadikan tawa sahabatnya, ada yang menangkap momen haru
            keluarga, ada pula yang memotret hal-hal kecil yang sering luput
            dari perhatian fotografer utama.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Dari sanalah Kenang Kurinji lahir.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Kami ingin menghadirkan cara yang lebih sederhana untuk
            mengumpulkan semua cerita tersebut dalam satu tempat. Bukan
            sekadar galeri foto, tetapi sebuah ruang di mana setiap tamu
            dapat menjadi bagian dari dokumentasi sebuah acara.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Terinspirasi dari pengalaman kamera disposable yang sederhana
            namun penuh kejutan, kami membangun Kenang Kurinji sebagai
            platform dokumentasi acara berbasis QR Code. Tanpa perlu
            mengunduh aplikasi, siapa pun dapat langsung memindai QR Code,
            mengambil foto melalui browser, dan ikut mengabadikan momen dari
            sudut pandangnya sendiri.
          </p>

          <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
            Karena kami percaya, sebuah acara bukan hanya milik penyelenggara
            atau fotografer. Sebuah acara adalah kumpulan cerita yang
            dibentuk oleh setiap orang yang hadir.
          </p>

          <p className="mt-4 font-body font-medium leading-relaxed text-neutral-midnight/80">
            Dan setiap cerita layak untuk dikenang.
          </p>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-crimson-50 text-crimson">
              <Target size={20} />
            </div>
            <h2 className="mt-4 font-heading text-xl font-semibold text-neutral-midnight">
              Visi Kami
            </h2>
            <p className="mt-3 font-body leading-relaxed text-neutral-midnight/70">
              Menjadi platform dokumentasi acara yang memungkinkan setiap
              orang ikut mengabadikan momen berharga melalui pengalaman yang
              sederhana, autentik, dan mudah diakses.
            </p>
          </div>

          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-crimson-50 text-crimson">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="mt-4 font-heading text-xl font-semibold text-neutral-midnight">
              Misi Kami
            </h2>
            <ul className="mt-3 space-y-3">
              {MISSIONS.map((mission) => (
                <li
                  key={mission}
                  className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-neutral-midnight/70"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-crimson"
                  />
                  {mission}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mengapa Kenang Kurinji + Fitur Utama */}
      <section className="bg-neutral-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-semibold text-neutral-midnight md:text-3xl">
              Mengapa Kenang Kurinji?
            </h2>
            <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
              Kenang Kurinji dirancang agar setiap tamu dapat menjadi bagian
              dari cerita sebuah acara. Dengan satu kali pemindaian QR Code,
              tamu dapat langsung mengambil foto menggunakan kamera di
              browser. Seluruh foto akan tersimpan secara otomatis ke dalam
              galeri acara sehingga setiap momen dapat dinikmati bersama
              setelah acara selesai.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex flex-col items-center gap-3 rounded-lg border border-neutral-slate p-4 text-center shadow-soft"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-crimson-50 text-crimson">
                    <Icon size={18} />
                  </div>
                  <span className="font-body text-xs font-medium leading-snug text-neutral-midnight/80">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filosofi Kami */}
      <section className="bg-neutral-midnight px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-semibold text-neutral-white md:text-3xl">
            Filosofi Kami
          </h2>
          <p className="mt-6 font-heading text-xl italic leading-relaxed text-neutral-white/90 md:text-2xl">
            Kami percaya bahwa sebuah kenangan bukan hanya tentang hasil foto
            yang sempurna, melainkan tentang cerita yang hidup di balik
            setiap jepretan.
          </p>
          <p className="mt-6 font-body text-neutral-white/60">
            Karena pada akhirnya, momen terbaik sering kali hadir tanpa
            direncanakan.
          </p>
          <p className="mt-8 font-heading text-2xl font-semibold tracking-wide text-neutral-white md:text-3xl">
            Scan. Jepret. Kenang.
          </p>
        </div>
      </section>

      {/* Bagian dari Kurinji Virtual Nusantara */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-semibold text-neutral-midnight md:text-3xl">
              Bagian dari Kurinji Virtual Nusantara
            </h2>
            <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
              Kenang Kurinji merupakan salah satu produk yang dikembangkan
              oleh{" "}
              <span className="font-medium text-neutral-midnight">
                Kurinji Virtual Nusantara (KVN)
              </span>
              , sebuah perusahaan teknologi kreatif yang membangun ekosistem
              produk digital untuk membantu individu, kreator, dan bisnis
              menghadirkan pengalaman digital yang lebih bermakna.
            </p>
            <p className="mt-4 font-body leading-relaxed text-neutral-midnight/70">
              Kami percaya bahwa teknologi seharusnya tidak hanya
              mempermudah pekerjaan, tetapi juga mampu menghubungkan orang,
              mengabadikan cerita, dan membuka peluang baru bagi para
              kreator serta pelaku usaha.
            </p>
          </div>

          <h3 className="mt-14 text-center font-heading text-lg font-semibold text-neutral-midnight">
            Ekosistem Kurinji Virtual Nusantara
          </h3>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className={`rounded-lg border p-6 shadow-soft ${
                    product.highlight
                      ? "border-crimson-100 bg-crimson-50/50"
                      : "border-neutral-slate bg-neutral-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-md ${
                      product.highlight
                        ? "bg-crimson text-neutral-white"
                        : "bg-neutral-slate/50 text-neutral-midnight"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-neutral-midnight">
                    {product.name}
                    {product.highlight && (
                      <span className="ml-2 rounded-full bg-crimson px-2 py-0.5 align-middle font-body text-[10px] font-medium text-neutral-white">
                        Kamu di sini
                      </span>
                    )}
                  </h4>
                  <p className="mt-2 font-body text-sm leading-relaxed text-neutral-midnight/60">
                    {product.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center font-body leading-relaxed text-neutral-midnight/70">
            Kami percaya bahwa teknologi bukan sekadar tentang fitur, tetapi
            tentang bagaimana teknologi dapat membantu orang menciptakan
            cerita, membangun hubungan, dan mengabadikan momen yang berarti.
            Melalui Kurinji Virtual Nusantara, kami terus berkomitmen
            menghadirkan inovasi yang menghubungkan kreativitas, teknologi,
            dan manusia dalam satu ekosistem yang saling melengkapi.
          </p>
        </div>
      </section>

      {/* Penutup */}
      <section className="relative overflow-hidden bg-crimson-50/40 px-6 py-20 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-4xl -translate-x-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(214,40,40,0.06),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-semibold text-neutral-midnight md:text-3xl">
            Penutup
          </h2>
          <p className="font-body leading-relaxed text-neutral-midnight/70">
            Terima kasih telah menjadi bagian dari perjalanan Kenang Kurinji.
            Kami berharap setiap QR Code yang dipindai, setiap foto yang
            diambil, dan setiap galeri yang tercipta dapat menjadi kenangan
            yang akan selalu dikenang, hari ini, esok, dan di masa yang akan
            datang.
          </p>

          <blockquote className="mt-2 space-y-1.5 border-l-2 border-crimson-100 pl-4 text-left font-heading italic leading-relaxed text-neutral-midnight/80">
            <p>Ada momen yang hanya terjadi sekali.</p>
            <p>Ada tawa yang tak bisa diulang.</p>
            <p>Ada pelukan yang hanya hadir pada hari itu.</p>
            <p className="pt-2">
              Tugas kami bukan sekadar menyimpan foto.
            </p>
            <p>Tugas kami adalah membantu Anda menyimpan cerita.</p>
          </blockquote>

          <p className="mt-2 font-heading text-2xl font-semibold tracking-wide text-neutral-midnight">
            Scan. Jepret. Kenang.
          </p>

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button variant="primary" className="px-6 py-3 text-base">
                Buat Event
              </Button>
            </Link>
            <Link href="/e/pernikahan-demo-fucr">
              <Button variant="secondary" className="px-6 py-3 text-base">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
      }
