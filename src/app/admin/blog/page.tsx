"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search, ExternalLink, Plus, Eye, EyeOff, Pencil } from "lucide-react";

interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string } | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/blog?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts(json.data);
    } catch {
      setError("Gagal memuat data artikel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  async function toggleStatus(post: AdminBlogPost) {
    const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyId(post.id);
    try {
      const res = await fetch(`/api/v1/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: nextStatus, publishedAt: json.data.publishedAt } : p
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah status artikel");
    } finally {
      setBusyId(null);
    }
  }

  async function deletePost(post: AdminBlogPost) {
    if (!confirm(`Hapus artikel "${post.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    setBusyId(post.id);
    try {
      const res = await fetch(`/api/v1/admin/blog/${post.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus artikel");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Blog</h1>
          <p className="font-body text-sm text-neutral-midnight/60 mt-1">
            Kelola artikel yang tampil di /blog.
          </p>
        </div>
        {/* Halaman tulis/edit artikel menyusul di langkah berikutnya — link
            ini sengaja sudah dipasang duluan supaya tidak perlu revisi file
            ini lagi nanti. */}
        <Link href="/admin/blog/new">
          <Button className="flex items-center gap-2 shrink-0">
            <Plus size={16} />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-midnight/40"
        />
        <Input
          placeholder="Cari judul artikel..."
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
        ) : posts.length === 0 ? (
          <p className="p-6 text-sm font-body text-neutral-midnight/50">
            Belum ada artikel. Klik &quot;Tulis Artikel&quot; buat mulai.
          </p>
        ) : (
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-neutral-slate text-left text-neutral-midnight/50">
                <th className="p-4 font-medium">Artikel</th>
                <th className="p-4 font-medium">Penulis</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Dibuat</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-neutral-slate last:border-0">
                  <td className="p-4">
                    <p className="text-neutral-midnight font-medium">{p.title}</p>
                    <p className="text-neutral-midnight/50 text-xs">/blog/{p.slug}</p>
                  </td>
                  <td className="p-4 text-neutral-midnight/70">{p.author?.name ?? "—"}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-slate/50 text-neutral-midnight/60"
                      }`}
                    >
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-midnight/70">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "PUBLISHED" && (
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                          <Button variant="ghost" title="Buka artikel">
                            <ExternalLink size={16} />
                          </Button>
                        </a>
                      )}
                      <Link href={`/admin/blog/${p.id}/edit`}>
                        <Button variant="ghost" title="Edit artikel">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        disabled={busyId === p.id}
                        onClick={() => toggleStatus(p)}
                        title={p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      >
                        {p.status === "PUBLISHED" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busyId === p.id}
                        onClick={() => deletePost(p)}
                        title="Hapus artikel"
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
