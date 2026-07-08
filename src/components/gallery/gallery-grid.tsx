"use client";

import { useMemo, useState } from "react";
import { Heart, Search, FolderPlus, Images, Sparkles, RefreshCw, Star } from "lucide-react";
import { cn, photoUrl } from "@/lib/utils";
import { FullscreenViewer } from "./fullscreen-viewer";
import { AlbumManager } from "./album-manager";

export interface GalleryPhoto {
  id: string;
  storageKey: string;
  thumbnailKey: string | null;
  filmType: string;
  isFavorite: boolean;
  uploadedAt: string;
  albumId: string | null;
  guest: { nickname: string | null } | null;
  aiScore: number | null;
  aiReason: string | null;
  aiIsBestShot: boolean;
  aiCategory: string | null;
  aiAnalyzedAt: string | null;
}

export interface Album {
  id: string;
  title: string;
  description?: string | null;
  _count?: { photos: number };
}

interface GalleryGridProps {
  eventId: string;
  initialPhotos: GalleryPhoto[];
  initialAlbums: Album[];
  hasAIAccess: boolean;
}

export function GalleryGrid({ eventId, initialPhotos, initialAlbums, hasAIAccess }: GalleryGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [albums, setAlbums] = useState(initialAlbums);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [managingAlbums, setManagingAlbums] = useState(false);
  const [processingAi, setProcessingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const pendingAiCount = photos.filter((p) => !p.aiAnalyzedAt).length;

  const runAiProcessing = async () => {
    setProcessingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/best-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const json = await res.json();
      if (!json.success) {
        setAiError(json.message ?? "Gagal memproses AI.");
        return;
      }
      // Data foto (skor/kategori/badge) berubah di server — reload halaman
      // paling sederhana & aman daripada merge manual di client.
      window.location.reload();
    } catch {
      setAiError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setProcessingAi(false);
    }
  };

  const visible = useMemo(() => {
    let result = photos;
    if (filter === "favorite") {
      result = result.filter((p) => p.isFavorite);
    } else if (filter !== "all") {
      result = result.filter((p) => p.albumId === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const nickname = p.guest?.nickname?.toLowerCase() ?? "";
        return nickname.includes(q) || p.filmType.toLowerCase().includes(q);
      });
    }
    return result;
  }, [photos, filter, query]);

  const toggleFavorite = async (photo: GalleryPhoto) => {
    const nextValue = !photo.isFavorite;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, isFavorite: nextValue } : p))
    );
    await fetch(`/api/v1/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: nextValue }),
    });
  };

  const assignAlbum = async (photo: GalleryPhoto, albumId: string | null) => {
    const prevAlbumId = photo.albumId;
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, albumId } : p))
    );
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === albumId) {
          return { ...a, _count: { photos: (a._count?.photos ?? 0) + 1 } };
        }
        if (a.id === prevAlbumId) {
          return { ...a, _count: { photos: Math.max(0, (a._count?.photos ?? 1) - 1) } };
        }
        return a;
      })
    );
    await fetch(`/api/v1/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId }),
    });
  };

  const deletePhoto = async (photo: GalleryPhoto) => {
    if (!confirm("Hapus foto ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setViewerIndex(null);
    await fetch(`/api/v1/photos/${photo.id}`, { method: "DELETE" });
  };

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-slate p-16 text-center">
        <p className="font-body text-sm text-neutral-midnight/60">
          Belum ada foto. Bagikan QR event ini supaya tamu mulai memotret.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-body border transition-colors",
              filter === "all"
                ? "border-crimson bg-crimson-50 text-crimson"
                : "border-neutral-slate text-neutral-midnight/70"
            )}
          >
            Semua ({photos.length})
          </button>
          <button
            onClick={() => setFilter("favorite")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-body border transition-colors",
              filter === "favorite"
                ? "border-crimson bg-crimson-50 text-crimson"
                : "border-neutral-slate text-neutral-midnight/70"
            )}
          >
            Favorit ({photos.filter((p) => p.isFavorite).length})
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setFilter(album.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-body border transition-colors flex items-center gap-1.5",
                filter === album.id
                  ? "border-crimson bg-crimson-50 text-crimson"
                  : "border-neutral-slate text-neutral-midnight/70"
              )}
            >
              <Images size={13} />
              {album.title} ({album._count?.photos ?? photos.filter((p) => p.albumId === album.id).length})
            </button>
          ))}
          <button
            onClick={() => setManagingAlbums(true)}
            className="rounded-md px-3 py-1.5 text-sm font-body border border-dashed border-neutral-slate text-neutral-midnight/60 flex items-center gap-1.5 hover:border-crimson hover:text-crimson"
          >
            <FolderPlus size={14} /> Album
          </button>
        </div>

        <div className="relative sm:ml-auto sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-midnight/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama tamu atau film..."
            className="w-full rounded-md border border-neutral-slate bg-neutral-white py-2 pl-9 pr-3 font-body text-sm text-neutral-midnight placeholder:text-neutral-midnight/40 focus:outline-none focus:ring-1 focus:ring-crimson"
          />
        </div>
      </div>

      {hasAIAccess && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-neutral-slate px-3 py-2">
          <span className="font-body text-sm text-neutral-midnight/60 flex items-center gap-1.5">
            <Sparkles size={14} className="text-crimson" />
            {pendingAiCount > 0
              ? `${pendingAiCount} foto belum dianalisis AI (Best Shot & kategori).`
              : "Semua foto sudah dianalisis AI."}
          </span>
          {pendingAiCount > 0 && (
            <button
              onClick={runAiProcessing}
              disabled={processingAi}
              className="ml-auto rounded-md border border-crimson bg-crimson-50 px-3 py-1.5 text-sm font-body text-crimson flex items-center gap-1.5 disabled:opacity-60"
            >
              {processingAi ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Memproses...
                </>
              ) : (
                "Proses AI"
              )}
            </button>
          )}
          {aiError && <span className="font-body text-xs text-red-600 w-full">{aiError}</span>}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="font-body text-sm text-neutral-midnight/50 py-10 text-center">
          {query.trim() ? "Tidak ada foto yang cocok dengan pencarian." : "Belum ada foto di sini."}
        </p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {visible.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setViewerIndex(i)}
              className="relative mb-3 block w-full break-inside-avoid rounded-md overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(photo.thumbnailKey ?? photo.storageKey)}
                alt=""
                className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
                loading="lazy"
              />
              {photo.isFavorite && (
                <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-midnight/50 flex items-center justify-center">
                  <Heart size={12} className="fill-crimson text-crimson" />
                </span>
              )}
              {photo.aiIsBestShot && (
                <span className="absolute top-2 left-2 rounded-full bg-crimson px-2 py-0.5 text-[10px] font-body font-semibold text-neutral-white flex items-center gap-1">
                  <Star size={10} className="fill-neutral-white" /> AI Best Shot
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {viewerIndex !== null && (
        <FullscreenViewer
          photos={visible}
          index={viewerIndex}
          albums={albums}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onToggleFavorite={toggleFavorite}
          onDelete={deletePhoto}
          onAssignAlbum={assignAlbum}
        />
      )}

      {managingAlbums && (
        <AlbumManager
          eventId={eventId}
          albums={albums}
          onClose={() => setManagingAlbums(false)}
          onCreated={(album) => setAlbums((prev) => [...prev, album])}
          onRenamed={(album) =>
            setAlbums((prev) => prev.map((a) => (a.id === album.id ? { ...a, ...album } : a)))
          }
          onDeleted={(albumId) => {
            setAlbums((prev) => prev.filter((a) => a.id !== albumId));
            setPhotos((prev) =>
              prev.map((p) => (p.albumId === albumId ? { ...p, albumId: null } : p))
            );
            if (filter === albumId) setFilter("all");
          }}
        />
      )}
    </div>
  );
}
