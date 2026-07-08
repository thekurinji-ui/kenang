"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
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
          Tulis Artikel Baru
        </h1>
      </div>

      <Card className="p-6">
        <BlogPostForm />
      </Card>
    </div>
  );
}
