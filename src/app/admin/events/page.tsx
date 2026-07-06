"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search, ExternalLink } from "lucide-react";

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  analytics: { totalPhotos: number; totalGuests: number; storageUsed: number } | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/events?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEvents(json.data);
    } catch {
      setError("Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  async function deleteEvent(event: AdminEvent) {
    if (!confirm(`Hapus event "${event.title}" milik ${event.owner.email}?`)) return;

    setBusyId(event.id);
    try {
      const res = await fetch(`/api/v1/admin/events/${event.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus event");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Semua Event</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Kelola seluruh event yang dibuat di Kenang Kurinji.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-midnight/40"
        />
        <Input
          placeholder="Cari judul event atau email host..."
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
        ) : events.length === 0 ? (
          <p className="p-6 text-sm font-body text-neutral-midnight/50">
            Tidak ada event ditemukan.
          </p>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-neutral-slate text-left text-neutral-midnight/50">
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Host</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Foto</th>
                <th className="p-4 font-medium">Tamu</th>
                <th className="p-4 font-medium">Dibuat</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-neutral-slate last:border-0">
                  <td className="p-4">
                    <p className="text-neutral-midnight font-medium">{e.title}</p>
                    <p className="text-neutral-midnight/50 text-xs">/e/{e.slug}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-neutral-midnight/70">{e.owner.name}</p>
                    <p className="text-neutral-midnight/50 text-xs">{e.owner.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-neutral-slate/50 text-neutral-midnight/60 px-2 py-1 rounded-full">
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-midnight/70">
                    {e.analytics?.totalPhotos ?? 0}
                  </td>
                  <td className="p-4 text-neutral-midnight/70">
                    {e.analytics?.totalGuests ?? 0}
                  </td>
                  <td className="p-4 text-neutral-midnight/70">
                    {new Date(e.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/e/${e.slug}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" title="Buka halaman event">
                          <ExternalLink size={16} />
                        </Button>
                      </a>
                      <Button
                        variant="danger"
                        disabled={busyId === e.id}
                        onClick={() => deleteEvent(e)}
                        title="Hapus event"
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
