import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 bg-neutral-white px-6 py-12">
      <Link href="/" className="flex flex-col items-center gap-1">
        <Image
          src="/logo.png"
          alt="Kenang Kurinji"
          width={180}
          height={91}
          priority
          className="h-12 w-auto"
        />
      </Link>
      {children}
    </main>
  );
}
