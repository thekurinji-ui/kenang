import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function generateMetadata({ params }: PageProps) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Artikel tidak ditemukan — Kenang Kurinji" };
  return {
    title: `${post.title} — Kenang Kurinji Blog`,
    description: post.excerpt ?? undefined,
  };
}

// Draft (atau slug yang salah) selalu notFound() di sini — tidak ada jalur
// yang membocorkan konten belum-publish ke publik.
export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(post.publishedAt)
    : null;

  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <article className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-body text-sm text-neutral-midnight/50 transition-colors hover:text-neutral-midnight"
          >
            <ArrowLeft size={16} />
            Kembali ke Blog
          </Link>

          <h1 className="mt-6 font-heading text-3xl font-semibold leading-tight text-neutral-midnight md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 font-body text-sm text-neutral-midnight/50">
            {post.author?.name && <span>{post.author.name}</span>}
            {formattedDate && (
              <>
                <span>·</span>
                <time>{formattedDate}</time>
              </>
            )}
          </div>

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-neutral-slate/40">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 672px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-neutral mt-10 max-w-none font-body prose-headings:font-heading prose-headings:font-semibold prose-a:text-crimson prose-img:rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      <LandingFooter />
    </main>
  );
}
