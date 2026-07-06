"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventCoverUploadProps {
  eventId: string;
  initialCoverImage: string | null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

// Host upload gambar cover di sini. Gambar ini yang tampil di layar
// pertama tamu setelah scan QR (lihat EventCoverScreen).
export function EventCoverUpload({ eventId, initialCoverImage }: EventCoverUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialCoverImage);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // biar bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format harus JPEG, PNG, atau WebP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Ukuran file maksimal 8MB");
      return;
    }

    // Preview lokal instan sebelum upload selesai
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/v1/events/${eventId}/cover`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Gagal mengunggah cover");
        setPreview(initialCoverImage);
        return;
      }

      setPreview(json.data.coverImage);
      router.refresh();
    } catch {
      setError("Gagal mengunggah cover. Periksa koneksi internet kamu.");
      setPreview(initialCoverImage);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const onDelete = async () => {
    if (!confirm("Hapus cover acara? Tamu akan melihat tampilan default.")) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/events/${eventId}/cover`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Gagal menghapus cover");
        return;
      }

      setPreview(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl">
      <h2 className="font-heading font-semibold text-neutral-midnight">Cover Acara</h2>
      <p className="font-body text-sm text-neutral-midnight/60 mt-1 mb-4">
        Gambar ini muncul saat tamu scan QR, sebelum mereka masuk ke kamera.
        Disarankan foto orientasi potret (portrait).
      </p>

      <div className="flex items-start gap-4">
        <div className="relative w-32 aspect-[3/4] shrink-0 overflow-hidden rounded-md border border-neutral-slate bg-neutral-slate/20">
          {preview ? (
            <img src={preview} alt="Cover acara" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImagePlus size={24} className="text-neutral-midnight/30" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={20} className="animate-spin text-neutral-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={pickFile}
            isLoading={isUploading}
            className="w-fit"
          >
            {preview ? "Ganti Cover" : "Upload Cover"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              isLoading={isDeleting}
              className="w-fit"
            >
              <Trash2 size={14} /> Hapus Cover
            </Button>
          )}
          <p className="font-body text-xs text-neutral-midnight/50">
            JPEG, PNG, atau WebP. Maksimal 8MB.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-crimson mt-3">{error}</p>}
    </Card>
  );
}
