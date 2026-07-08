"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";

export interface BlogPostFormValues {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
}

interface BlogPostFormProps {
  initial?: BlogPostFormValues;
}

const EMPTY: BlogPostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: null,
  status: "DRAFT",
};

export function BlogPostForm({ initial }: BlogPostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<BlogPostFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"DRAFT" | "PUBLISHED" | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/v1/admin/blog/cover", { method: "POST", body });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setForm((f) => ({ ...f, coverImage: json.data.coverImage }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload cover");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!form.title.trim() || form.title.trim().length < 3) {
      setError("Judul minimal 3 karakter");
      return;
    }
    if (!form.content.trim()) {
      setError("Isi artikel wajib diisi");
      return;
    }

    setSaving(status);
    setError(null);

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content,
      coverImage: form.coverImage,
      status,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/v1/admin/blog/${initial!.id}` : "/api/v1/admin/blog",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan artikel");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Cover image */}
      <div>
        <label className="text-xs font-body text-neutral-midnight/60 block mb-1.5">
          Cover Artikel
        </label>
        {form.coverImage ? (
          <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-md border border-neutral-slate">
            <Image src={form.coverImage} alt="Cover" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, coverImage: null }))}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              title="Hapus cover"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCover}
            className="flex aspect-[16/9] w-full max-w-md flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-slate bg-neutral-slate/20 text-neutral-midnight/50 transition-colors hover:bg-neutral-slate/30"
          >
            {uploadingCover ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <ImagePlus size={22} />
            )}
            <span className="font-body text-xs">
              {uploadingCover ? "Mengunggah..." : "Klik untuk upload cover (JPEG/PNG/WebP, maks 8MB)"}
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverPick}
          className="hidden"
        />
      </div>

      <Input
        label="Judul Artikel"
        placeholder="5 Tips Dokumentasi Acara Pakai Kamera Disposable Digital"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />

      <div>
        <label className="text-xs font-body text-neutral-midnight/60 block mb-1.5">
          Ringkasan (tampil di list /blog)
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Opsional, maks 300 karakter"
          maxLength={300}
          rows={2}
          className="w-full rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5 font-body text-sm text-neutral-midnight placeholder:text-neutral-midnight/40 focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition-colors resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-body text-neutral-midnight/60 block mb-1.5">
          Isi Artikel (Markdown)
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder={"## Subjudul\n\nTulis isi artikel di sini. Mendukung Markdown: **tebal**, *miring*, [link](https://...), gambar, list, dll."}
          rows={16}
          className="w-full rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5 font-body text-sm text-neutral-midnight placeholder:text-neutral-midnight/40 focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition-colors font-mono"
        />
      </div>

      {error && <p className="text-sm font-body text-crimson">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => router.push("/admin/blog")} disabled={saving !== null}>
          Batal
        </Button>
        <Button
          variant="ghost"
          onClick={() => save("DRAFT")}
          disabled={saving !== null || uploadingCover}
        >
          {saving === "DRAFT" ? "Menyimpan..." : "Simpan sebagai Draft"}
        </Button>
        <Button onClick={() => save("PUBLISHED")} disabled={saving !== null || uploadingCover}>
          {saving === "PUBLISHED" ? "Menerbitkan..." : "Terbitkan"}
        </Button>
      </div>
    </div>
  );
        }
