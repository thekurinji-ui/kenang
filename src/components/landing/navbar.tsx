import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-slate/70 bg-neutral-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold text-neutral-midnight">
          <span aria-hidden>🌸</span>
          Kenang Kurinji
        </Link>
        <nav className="hidden items-center gap-8 font-body text-sm font-medium text-neutral-midnight/70 md:flex">
          <Link href="/features" className="transition-colors hover:text-neutral-midnight">
            Fitur
          </Link>
          <a href="#harga" className="transition-colors hover:text-neutral-midnight">
            Harga
          </a>
          <Link href="/faq" className="transition-colors hover:text-neutral-midnight">
            FAQ
          </Link>
          <Link href="/about" className="transition-colors hover:text-neutral-midnight">
            Tentang
          </Link>
          <Link href="/contact" className="transition-colors hover:text-neutral-midnight">
            Kontak
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Buat Event</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
