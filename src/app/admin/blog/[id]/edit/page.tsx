"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BlogPostForm, type BlogPostFormValues } from "@/components/admin/blog-post-form";

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<BlogPostFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/admin/blog/${params.id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        if (cancelled) return;
        setInitial({
          id: json.data.id,
          title: json.data.title,
          excerpt: json.data.excerpt ?? "",
          content: json.data.content,
          coverImage: json.data.coverImage,
          status: json.data.status,
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat artikel");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 font-body text-sm text-neutral-midnight/50 hover:text-neutral-midnight transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Blog
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-neutral-midnight">
          Edit Artikel
        </h1>
      </div>

      <Card className="p-6">
        {error ? (
          <p className="font-body text-sm text-crimson">{error}</p>
        ) : !initial ? (
          <p className="font-body text-sm text-neutral-midnight/50">Memuat...</p>
        ) : (
          <BlogPostForm initial={initial} />
        )}
      </Card>
    </div>
  );
}
