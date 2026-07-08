"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldOff, Trash2, Search, PenSquare } from "lucide-react";

type PlanId = "KINCAI" | "KURINJI" | "GUNUNG_TUJUH" | "GUNUNG_KERINCI";
type SubStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

const PLAN_OPTIONS: { value: PlanId; label: string }[] = [
  { value: "KINCAI", label: "Kincai" },
  { value: "KURINJI", label: "Kurinji" },
  { value: "GUNUNG_TUJUH", label: "Gunung Tujuh" },
  { value: "GUNUNG_KERINCI", label: "Gunung Kerinci" },
];

const STATUS_OPTIONS: { value: SubStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "CANCELED", label: "Canceled" },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "GUEST" | "VIEWER";
  createdAt: string;
  subscription: { plan: PlanId; status: SubStatus; expiresAt: string | null } | null;
  _count: { events: number };
}

/** Format Date -> "YYYY-MM-DD" buat value <input type="date">. */
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<PlanId>("KINCAI");
  const [editStatus, setEditStatus] = useState<SubStatus>("ACTIVE");
  const [editExpiresAt, setEditExpiresAt] = useState("");

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/users?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUsers(json.data);
    } catch {
      setError("Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  async function toggleAdmin(user: AdminUser) {
    const nextRole = user.role === "ADMIN" ? "OWNER" : "ADMIN";
    const label = nextRole === "ADMIN" ? "menjadikan admin" : "mencabut akses admin dari";
    if (!confirm(`Yakin ${label} "${user.name}"?`)) return;

    setBusyId(user.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah role");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (
      !confirm(
        `Hapus akun "${user.name}" (${user.email})? Semua event, foto, dan datanya akan ikut terhapus permanen. Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;

    setBusyId(user.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus user");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditPlan(user.subscription?.plan ?? "KINCAI");
    setEditStatus(user.subscription?.status ?? "ACTIVE");
    setEditExpiresAt(toDateInputValue(user.subscription?.expiresAt));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveSubscription(user: AdminUser) {
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editPlan,
          status: editStatus,
          expiresAt: editExpiresAt || null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, subscription: json.data } : u))
      );
      setEditingId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah plan");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Semua User</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Kelola seluruh akun yang terdaftar di Kenang Kurinji.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-midnight/40"
        />
        <Input
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm font-body text-neutral-midnight/50">Memuat...</p>
        ) : error ? (
          <p className="p-6 text-sm font-body text-crimson">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm font-body text-neutral-midnight/50">Tidak ada user ditemukan.</p>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-neutral-slate text-left text-neutral-midnight/50">
                <th className="p-4 font-medium">Nama</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Bergabung</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-slate last:border-0">
                  <td className="p-4">
                    <p className="text-neutral-midnight font-medium">{u.name}</p>
                    <p className="text-neutral-midnight/50 text-xs">{u.email}</p>
                  </td>
                  <td className="p-4 text-neutral-midnight/70">
                    {editingId === u.id ? (
                      <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <select
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value as PlanId)}
                          className="rounded-md border border-neutral-slate bg-neutral-white px-2 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-crimson/40"
                        >
                          {PLAN_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as SubStatus)}
                          className="rounded-md border border-neutral-slate bg-neutral-white px-2 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-crimson/40"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editExpiresAt}
                          onChange={(e) => setEditExpiresAt(e.target.value)}
                          placeholder="Tanpa batas"
                          title="Masa aktif — kosongkan untuk tanpa batas waktu"
                          className="rounded-md border border-neutral-slate bg-neutral-white px-2 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-crimson/40"
                        />
                        <div className="flex gap-1.5">
                          <Button
                            variant="primary"
                            className="text-xs px-2.5 py-1.5"
                            disabled={busyId === u.id}
                            onClick={() => saveSubscription(u)}
                          >
                            Simpan
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs px-2.5 py-1.5"
                            disabled={busyId === u.id}
                            onClick={cancelEdit}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span>
                        {PLAN_OPTIONS.find((p) => p.value === u.subscription?.plan)?.label ??
                          "Kincai"}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-neutral-midnight/70">{u._count.events}</td>
                  <td className="p-4 text-neutral-midnight/70">
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4">
                    {u.role === "ADMIN" ? (
                      <span className="text-xs bg-crimson-50 text-crimson px-2 py-1 rounded-full font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs bg-neutral-slate/50 text-neutral-midnight/60 px-2 py-1 rounded-full">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        disabled={busyId === u.id || editingId === u.id}
                        onClick={() => startEdit(u)}
                        title="Edit plan / subscription"
                      >
                        <PenSquare size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busyId === u.id}
                        onClick={() => toggleAdmin(u)}
                        title={u.role === "ADMIN" ? "Cabut akses admin" : "Jadikan admin"}
                      >
                        {u.role === "ADMIN" ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busyId === u.id}
                        onClick={() => deleteUser(u)}
                        title="Hapus user"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
          }
