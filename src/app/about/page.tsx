import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Tentang Kenang Kurinji
          </h1>

          <p className="mt-6 font-body text-neutral-midnight/70 leading-relaxed">
            Neelakurinji adalah bunga langka yang hanya mekar setiap 12 tahun sekali di
            pegunungan — momen mekarnya begitu dinanti karena begitu jarang terjadi. Dari
            filosofi itulah nama <span className="font-medium text-neutral-midnight">Kenang Kurinji</span>{" "}
            lahir: setiap momen spesial dalam hidup — pernikahan, ulang tahun, gathering — juga
            layak dirayakan dan diabadikan seistimewa bunga yang mekar sekali dalam belasan tahun.
          </p>

          <p className="mt-4 font-body text-neutral-midnight/70 leading-relaxed">
            Kami percaya cara terbaik mengenang sebuah acara bukan cuma dari foto dokumentasi
            resmi, tapi dari sudut pandang setiap tamu yang datang. Karena itu Kenang Kurinji
            menghadirkan kembali sensasi kamera disposable — sederhana, spontan, penuh kejutan —
            dalam bentuk digital yang bisa diakses siapa saja lewat browser, tanpa install
            apapun.
          </p>

          <h2 className="mt-10 font-heading text-xl font-semibold text-neutral-midnight">
            Visi Kami
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70 leading-relaxed">
            Membuat dokumentasi momen menjadi sederhana, autentik, dan mobile-first — setiap
            tamu jadi fotografer, setiap sudut pandang jadi bagian dari kenangan bersama.
          </p>

          <h2 className="mt-10 font-heading text-xl font-semibold text-neutral-midnight">
            Bagian dari Kurinji Virtual Nusantara
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70 leading-relaxed">
            Kenang Kurinji dikembangkan oleh <span className="font-medium">Kurinji Virtual Nusantara (KVN)</span>,
            sebuah ekosistem digital yang berbasis di Kerinci, Jambi — merayakan keindahan alam
            dan budaya Nusantara lewat produk-produk digital yang membekas.
          </p>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
