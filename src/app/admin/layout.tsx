import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const check = await requireAdmin();

  if (!check.ok) {
    redirect(check.code === "UNAUTHORIZED" ? "/login" : "/dashboard");
  }

  return (
    <div className="flex min-h-dvh bg-neutral-white">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
