import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export async function LandingNavbar() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-slate/70 bg-neutral-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Kenang Kurinji"
            width={160}
            height={81}
            priority
            className="h-9 w-auto"
          />
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
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="primary">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Buat Event</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
