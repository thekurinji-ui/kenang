"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Homepage Blueprint v3.3 — Section 1 (Navbar)
const NAV_LINKS = [
  { href: "/features", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/blog", label: "Blog" },
];

interface LandingNavbarClientProps {
  isLoggedIn: boolean;
}

export function LandingNavbarClient({ isLoggedIn }: LandingNavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Blur halus + navbar mengecil saat pengguna menggulir halaman.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Kunci scroll body saat mobile menu terbuka.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-neutral-slate/70 bg-neutral-white/80 shadow-soft backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-14" : "h-20"
        }`}
      >
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image
            src="/logo.png"
            alt="Kenang Kurinji"
            width={160}
            height={81}
            priority
            className={`w-auto transition-all duration-300 ${scrolled ? "h-7" : "h-9"}`}
          />
        </Link>

        <nav className="hidden items-center gap-8 font-body text-sm font-medium text-neutral-midnight/70 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-neutral-midnight"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button variant="primary">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-flex">
                <Button variant="primary">Buat Event</Button>
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-midnight transition-colors hover:bg-neutral-slate/40 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — Design Rules: Mobile First */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-neutral-slate/70 bg-neutral-white px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-4 font-body text-sm font-medium text-neutral-midnight/80">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="transition-colors hover:text-neutral-midnight"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Buat Event
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
                }
