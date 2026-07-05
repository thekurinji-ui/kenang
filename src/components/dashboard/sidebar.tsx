"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, CreditCard, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "My Events", icon: CalendarDays },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 border-r border-neutral-slate bg-neutral-white h-dvh sticky top-0 p-4">
      <Link href="/" className="flex items-center gap-2 px-2 py-3">
        <span className="text-xl">🌸</span>
        <span className="font-heading font-semibold text-neutral-midnight">Kenang Kurinji</span>
      </Link>

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
                  ? "bg-crimson-50 text-crimson font-medium"
                  : "text-neutral-midnight/70 hover:bg-neutral-slate/40"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm text-neutral-midnight/70 hover:bg-neutral-slate/40"
      >
        <LogOut size={18} />
        Keluar
      </button>
    </aside>
  );
}
