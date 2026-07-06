import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-slate bg-neutral-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Kenang Kurinji"
            width={140}
            height={71}
            className="h-7 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6 font-body text-xs font-medium text-neutral-midnight/60">
          <Link href="/features" className="transition-colors hover:text-neutral-midnight">
            Fitur
          </Link>
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
        <p className="font-body text-xs text-neutral-midnight/50">
          © {new Date().getFullYear()} Kenang Kurinji. Scan. Jepret. Kenang.
        </p>
      </div>
    </footer>
  );
}
