"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, CalendarDays, Newspaper, LogOut, ArrowLeftCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Semua User", icon: Users },
  { href: "/admin/events", label: "Semua Event", icon: CalendarDays },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 border-r border-neutral-slate bg-neutral-midnight h-dvh sticky top-0 p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="text-xl">🛡️</span>
        <span className="font-heading font-semibold text-neutral-white">Super Admin</span>
      </div>

      <nav className="flex flex-col gap-1 mt-4 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm transition-colors",
                active
                  ? "bg-crimson text-neutral-white font-medium"
                  : "text-neutral-white/70 hover:bg-neutral-white/10"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm text-neutral-white/70 hover:bg-neutral-white/10"
      >
        <ArrowLeftCircle size={18} />
        Kembali ke Dashboard
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm text-neutral-white/70 hover:bg-neutral-white/10"
      >
        <LogOut size={18} />
        Keluar
      </button>
    </aside>
  );
}
