"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search, ExternalLink, Plus, Pencil, X } from "lucide-react";

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  revealMode?: string;
  shotLimit?: number | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  analytics: { totalPhotos: number; totalGuests: number; storageUsed: number } | null;
}

interface EventFormState {
  ownerEmail: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  revealMode: string;
  shotLimit: string;
  status: string;
}

const EMPTY_FORM: EventFormState = {
  ownerEmail: "",
  title: "",
  description: "",
  eventDate: "",
  location: "",
  revealMode: "INSTANT",
  shotLimit: "",
  status: "DRAFT",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form create/edit — null = tertutup, "new" = mode buat, id = mode edit
  const [formMode, setFormMode] = useState<"new" | string | null>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  function openCreateForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormMode("new");
  }

  function openEditForm(event: AdminEvent) {
    setForm({
      ownerEmail: event.owner.email,
      title: event.title,
      description: event.description ?? "",
      eventDate: event.eventDate ? event.eventDate.slice(0, 10) : "",
      location: event.location ?? "",
      revealMode: event.revealMode ?? "INSTANT",
      shotLimit: event.shotLimit ? String(event.shotLimit) : "",
      status: event.status,
    });
    setFormError(null);
    setFormMode(event.id);
  }

  function closeForm() {
    setFormMode(null);
    setFormError(null);
  }

  async function submitForm() {
    if (!form.title.trim() || form.title.trim().length < 3) {
      setFormError("Judul minimal 3 karakter");
      return;
    }
    if (formMode === "new" && !form.ownerEmail.trim()) {
      setFormError("Email client wajib diisi");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      eventDate: form.eventDate || undefined,
      location: form.location.trim() || undefined,
      revealMode: form.revealMode,
      shotLimit: form.shotLimit ? Number(form.shotLimit) : null,
    };
    if (formMode === "new") {
      payload.ownerEmail = form.ownerEmail.trim();
    } else {
      payload.status = form.status;
    }

    try {
      const res = await fetch(
        formMode === "new" ? "/api/v1/admin/events" : `/api/v1/admin/events/${formMode}`,
        {
          method: formMode === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      closeForm();
      load(search);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Gagal menyimpan event");
    } finally {
      setSaving(false);
    }
  }

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Semua Event</h1>
          <p className="font-body text-sm text-neutral-midnight/60 mt-1">
            Kelola seluruh event yang dibuat di Kenang Kurinji.
          </p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2 shrink-0">
          <Plus size={16} />
          Buat Event
        </Button>
      </div>

      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-neutral-midnight">
                {formMode === "new" ? "Buat Event Baru" : "Edit Event"}
              </h2>
              <button onClick={closeForm} className="text-neutral-midnight/50 hover:text-neutral-midnight">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {formMode === "new" && (
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">
                    Email Client (pemilik event)
                  </label>
                  <Input
                    placeholder="client@email.com"
                    value={form.ownerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Judul Event</label>
                <Input
                  placeholder="Pernikahan Andi & Sari"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Deskripsi</label>
                <Input
                  placeholder="Opsional"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Tanggal Event</label>
                  <Input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Lokasi</label>
                  <Input
                    placeholder="Opsional"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Mode Reveal</label>
                  <select
                    value={form.revealMode}
                    onChange={(e) => setForm((f) => ({ ...f, revealMode: e.target.value }))}
                    className="w-full h-10 rounded-md border border-neutral-slate px-3 text-sm font-body bg-white"
                  >
                    <option value="INSTANT">Instan</option>
                    <option value="AFTER_EVENT_ENDS">Setelah Event Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">
                    Batas Foto (kosongkan = tanpa batas)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Tanpa batas"
                    value={form.shotLimit}
                    onChange={(e) => setForm((f) => ({ ...f, shotLimit: e.target.value }))}
                  />
                </div>
              </div>

              {formMode !== "new" && (
                <div>
                  <label className="text-xs font-body text-neutral-midnight/60 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full h-10 rounded-md border border-neutral-slate px-3 text-sm font-body bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="LIVE">Live</option>
                    <option value="ENDED">Selesai</option>
                    <option value="ARCHIVED">Arsip</option>
                  </select>
                </div>
              )}
            </div>

            {formError && <p className="text-sm font-body text-crimson">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeForm} disabled={saving}>
                Batal
              </Button>
              <Button onClick={submitForm} disabled={saving}>
                {saving ? "Menyimpan..." : formMode === "new" ? "Buat Event" : "Simpan"}
              </Button>
            </div>
          </Card>
        </div>
      )}

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
                      <Button variant="ghost" onClick={() => openEditForm(e)} title="Edit event">
                        <Pencil size={16} />
                      </Button>
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
