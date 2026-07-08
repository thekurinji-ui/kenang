"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Trash2, Images, Star } from "lucide-react";
import { cn, photoUrl } from "@/lib/utils";
import type { Album, GalleryPhoto } from "./gallery-grid";

interface FullscreenViewerProps {
  photos: GalleryPhoto[];
  index: number;
  albums: Album[];
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleFavorite: (photo: GalleryPhoto) => void;
  onDelete: (photo: GalleryPhoto) => void;
  onAssignAlbum: (photo: GalleryPhoto, albumId: string | null) => void;
}

export function FullscreenViewer({
  photos,
  index,
  albums,
  onClose,
  onNavigate,
  onToggleFavorite,
  onDelete,
  onAssignAlbum,
}: FullscreenViewerProps) {
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < photos.length - 1) onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-midnight/95 flex items-center justify-center animate-fade-in">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-neutral-white/10 flex items-center justify-center text-neutral-white"
      >
        <X size={20} />
      </button>

      {index > 0 && (
        <button
          aria-label="Sebelumnya"
          onClick={() => onNavigate(index - 1)}
          className="absolute left-4 h-10 w-10 rounded-full bg-neutral-white/10 flex items-center justify-center text-neutral-white"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          aria-label="Berikutnya"
          onClick={() => onNavigate(index + 1)}
          className="absolute right-4 h-10 w-10 rounded-full bg-neutral-white/10 flex items-center justify-center text-neutral-white"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {photo.aiIsBestShot && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 px-4 text-center">
          <span className="rounded-full bg-crimson px-3 py-1 text-xs font-body font-semibold text-neutral-white flex items-center gap-1.5">
            <Star size={12} className="fill-neutral-white" /> AI Best Shot
          </span>
          {photo.aiReason && (
            <span className="font-body text-xs text-neutral-white/70 max-w-sm">{photo.aiReason}</span>
          )}
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(photo.storageKey)}
        alt=""
        className="max-h-[80vh] max-w-[90vw] object-contain rounded-md"
      />

      <div className="absolute bottom-6 flex flex-wrap items-center justify-center gap-3 px-4">
        <button
          onClick={() => onToggleFavorite(photo)}
          className="flex items-center gap-2 rounded-md bg-neutral-white/10 px-4 py-2 text-sm text-neutral-white"
        >
          <Heart
            size={16}
            className={cn(photo.isFavorite && "fill-crimson text-crimson")}
          />
          {photo.isFavorite ? "Favorit" : "Tandai Favorit"}
        </button>

        {albums.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-neutral-white/10 px-3 py-2 text-sm text-neutral-white">
            <Images size={15} />
            <select
              value={photo.albumId ?? ""}
              onChange={(e) => onAssignAlbum(photo, e.target.value || null)}
              className="bg-transparent text-sm text-neutral-white focus:outline-none [&>option]:text-neutral-midnight"
            >
              <option value="">Tanpa album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => onDelete(photo)}
          className="flex items-center gap-2 rounded-md bg-crimson/20 px-4 py-2 text-sm text-crimson"
        >
          <Trash2 size={16} /> Hapus
        </button>
      </div>
    </div>
  );
}
