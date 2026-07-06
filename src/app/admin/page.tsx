import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  const mb = bytes / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default async function AdminOverviewPage() {
  const check = await requireAdmin();
  if (!check.ok) redirect(check.code === "UNAUTHORIZED" ? "/login" : "/dashboard");

  const [
    totalUsers,
    totalEvents,
    totalPhotos,
    totalGuests,
    storageAgg,
    revenueAgg,
    planCounts,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.photo.count(),
    prisma.guest.count(),
    prisma.analytics.aggregate({ _sum: { storageUsed: true } }),
    prisma.paymentOrder.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  const stats = [
    { label: "Total User", value: totalUsers.toLocaleString("id-ID") },
    { label: "Total Event", value: totalEvents.toLocaleString("id-ID") },
    { label: "Total Foto", value: totalPhotos.toLocaleString("id-ID") },
    { label: "Total Tamu", value: totalGuests.toLocaleString("id-ID") },
    { label: "Storage Terpakai", value: formatBytes(storageAgg._sum.storageUsed ?? 0) },
    { label: "Total Revenue", value: formatRupiah(revenueAgg._sum.amount ?? 0) },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">
          Overview Platform
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Ringkasan seluruh aktivitas Kenang Kurinji.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-body text-neutral-midnight/50">{s.label}</p>
            <p className="font-heading text-2xl font-semibold text-neutral-midnight mt-1">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-heading font-semibold text-neutral-midnight mb-4">
            Distribusi Plan
          </h2>
          {planCounts.length === 0 ? (
            <p className="text-sm font-body text-neutral-midnight/50">Belum ada data.</p>
          ) : (
            <div className="space-y-2">
              {planCounts.map((p) => (
                <div key={p.plan} className="flex items-center justify-between text-sm font-body">
                  <span className="text-neutral-midnight/70">{p.plan}</span>
                  <span className="font-medium text-neutral-midnight">{p._count.plan}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-heading font-semibold text-neutral-midnight mb-4">
            User Terbaru
          </h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm font-body">
                <div>
                  <p className="text-neutral-midnight font-medium">{u.name}</p>
                  <p className="text-neutral-midnight/50 text-xs">{u.email}</p>
                </div>
                {u.role === "ADMIN" && (
                  <span className="text-xs bg-crimson-50 text-crimson px-2 py-1 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
