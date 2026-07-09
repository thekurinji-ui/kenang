import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";

// Homepage Blueprint v3.3 — Section 16 (Footer)
const NAV_LINKS = [
  { label: "Fitur", href: "/features" },
  { label: "Harga", href: "/#harga" },
  { label: "FAQ", href: "/faq" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const LEGAL_LINKS = [
  { label: "Kebijakan Privasi", href: "/privacy" },
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Kebijakan Cookie", href: "/cookies" },
  { label: "Kebijakan Penggunaan AI", href: "/ai-policy" },
  { label: "Persetujuan Penggunaan Foto", href: "/photo-consent" },
  { label: "Refund & Pembatalan", href: "/refund-policy" },
  { label: "Hak Cipta", href: "/copyright" },
  { label: "Penghapusan Data", href: "/data-deletion" },
  { label: "Kontak & Bantuan", href: "/help" },
];

const SOCIALS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/6285161016094",
    icon: MessageCircle,
  },
  {
    label: "Instagram @kenangkurinji",
    href: "https://instagram.com/kenangkurinji",
    icon: Instagram,
  },
  {
    label: "Instagram @thekurinji",
    href: "https://instagram.com/thekurinji",
    icon: Instagram,
  },
  {
    label: "TikTok @thekurinji",
    href: "https://tiktok.com/@thekurinji",
    // Lucide belum punya ikon TikTok resmi — pakai glyph teks agar tetap ringan.
    icon: null,
  },
];

function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82c-1.1-.76-1.83-1.99-1.98-3.39h-3.06v13.7c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1-2.77-2.77 2.77 2.77 0 0 1 2.77-2.77c.28 0 .55.04.8.12V10.4a5.9 5.9 0 0 0-.8-.06 5.85 5.85 0 0 0-5.85 5.85A5.85 5.85 0 0 0 8.79 22a5.85 5.85 0 0 0 5.85-5.85V9.01a8.9 8.9 0 0 0 4.66 1.32V7.28a5.63 5.63 0 0 1-2.7-1.46Z" />
    </svg>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-slate bg-neutral-white px-6 pb-8 pt-12 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 sm:text-left lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Kenang Kurinji"
                width={140}
                height={71}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-4 font-body text-sm text-neutral-midnight/60">
              Bagian dari <span className="font-medium">KURINJI VIRTUAL NUSANTARA</span>
            </p>
            <p className="mt-3 font-heading text-sm font-semibold text-neutral-midnight">
              Scan. Jepret. Kenang.
            </p>
          </div>

          {/* Navigasi */}
          <div className="flex flex-col items-center sm:items-start">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-neutral-midnight/40">
              Navigasi
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="flex flex-col items-center sm:items-start">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-neutral-midnight/40">
              Kontak
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="mailto:halo@kurinji.asia"
                  className="flex items-center gap-2 font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                >
                  <Mail size={14} className="shrink-0" />
                  halo@kurinji.asia
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6285161016094"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                >
                  <MessageCircle size={14} className="shrink-0" />
                  +62 851-6101-6094
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/thekurinji"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                >
                  <Instagram size={14} className="shrink-0" />
                  @thekurinji
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@thekurinji"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                >
                  <TikTokGlyph />
                  @thekurinji
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center sm:items-start">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-neutral-midnight/40">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-neutral-midnight/70 transition-colors hover:text-neutral-midnight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-neutral-slate pt-6 text-center md:mt-12 sm:flex-row sm:justify-between sm:text-left">
          <p className="font-body text-xs text-neutral-midnight/50">
            © {new Date().getFullYear()} Kenang Kurinji. Scan. Jepret. Kenang.
          </p>
          <p className="font-body text-xs italic text-neutral-midnight/40">
            &ldquo;Setiap kenangan dimulai dari satu jepretan.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
