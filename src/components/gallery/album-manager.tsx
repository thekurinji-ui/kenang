"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Album } from "./gallery-grid";

interface AlbumManagerProps {
  eventId: string;
  albums: Album[];
  onClose: () => void;
  onCreated: (album: Album) => void;
  onRenamed: (album: Album) => void;
  onDeleted: (albumId: string) => void;
}

export function AlbumManager({
  eventId,
  albums,
  onClose,
  onCreated,
  onRenamed,
  onDeleted,
}: AlbumManagerProps) {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const createAlbum = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    const res = await fetch(`/api/v1/events/${eventId}/albums`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok || !json.success) {
      setError(json.message ?? "Gagal membuat album");
      return;
    }
    onCreated(json.data);
    setTitle("");
  };

  const renameAlbum = async (albumId: string) => {
    if (!editingTitle.trim()) return;
    const res = await fetch(`/api/v1/albums/${albumId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle.trim() }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      onRenamed({ ...json.data, _count: albums.find((a) => a.id === albumId)?._count });
    }
    setEditingId(null);
  };

  const deleteAlbum = async (albumId: string) => {
    if (!confirm("Hapus album ini? Foto di dalamnya tidak akan terhapus, hanya keluar dari album.")) {
      return;
    }
    await fetch(`/api/v1/albums/${albumId}`, { method: "DELETE" });
    onDeleted(albumId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-midnight/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-neutral-midnight">
            Kelola Album
          </h2>
          <button onClick={onClose} className="text-neutral-midnight/50 hover:text-neutral-midnight">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createAlbum()}
            placeholder="Nama album baru..."
            className="flex-1 rounded-md border border-neutral-slate bg-neutral-white px-3 py-2 font-body text-sm text-neutral-midnight placeholder:text-neutral-midnight/40 focus:outline-none focus:ring-1 focus:ring-crimson"
          />
          <Button onClick={createAlbum} isLoading={creating}>
            <Plus size={16} />
          </Button>
        </div>
        {error && <p className="mt-2 font-body text-xs text-crimson">{error}</p>}

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {albums.length === 0 && (
            <p className="py-6 text-center font-body text-sm text-neutral-midnight/50">
              Belum ada album. Buat album pertama di atas.
            </p>
          )}
          {albums.map((album) => (
            <div
              key={album.id}
              className="flex items-center justify-between gap-2 rounded-md border border-neutral-slate px-3 py-2"
            >
              {editingId === album.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && renameAlbum(album.id)}
                  onBlur={() => renameAlbum(album.id)}
                  className="flex-1 rounded border border-neutral-slate px-2 py-1 font-body text-sm"
                />
              ) : (
                <span className="font-body text-sm text-neutral-midnight">
                  {album.title}{" "}
                  <span className="text-neutral-midnight/40">({album._count?.photos ?? 0})</span>
                </span>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(album.id);
                    setEditingTitle(album.title);
                  }}
                  className="rounded p-1.5 text-neutral-midnight/50 hover:bg-neutral-slate/40 hover:text-neutral-midnight"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="rounded p-1.5 text-neutral-midnight/50 hover:bg-crimson-50 hover:text-crimson"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
