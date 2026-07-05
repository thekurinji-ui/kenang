import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 bg-neutral-white px-6 py-12">
      <Link href="/" className="flex flex-col items-center gap-1">
        <span className="text-3xl">🌸</span>
        <span className="font-heading text-lg font-semibold text-neutral-midnight">
          Kenang Kurinji
        </span>
      </Link>
      {children}
    </main>
  );
}
