import Image from "next/image";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Blog — Kenang Kurinji",
  description: "Cerita, tips dokumentasi acara, dan pembaruan dari Kenang Kurinji.",
};

// Halaman publik, murni baca — hanya post berstatus PUBLISHED yang tampil.
// Draft tidak pernah bocor ke sini walau di-fetch langsung dari database.
export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Blog
          </h1>
          <p className="mt-3 font-body text-neutral-midnight/60">
            Cerita, tips dokumentasi acara, dan pembaruan dari Kenang Kurinji.
          </p>

          {posts.length === 0 ? (
            <p className="mt-16 font-body text-neutral-midnight/50">
              Belum ada artikel. Cek lagi nanti ya.
            </p>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-neutral-slate/70 transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full bg-neutral-slate/40">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-crimson/10 to-neutral-slate/40">
                        <span className="font-heading text-sm text-neutral-midnight/30">
                          Kenang Kurinji
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-lg font-semibold leading-snug text-neutral-midnight">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 font-body text-sm text-neutral-midnight/60">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2 font-body text-xs text-neutral-midnight/40">
                      {post.author?.name && <span>{post.author.name}</span>}
                      {post.publishedAt && (
                        <>
                          <span>·</span>
                          <time dateTime={post.publishedAt.toISOString()}>
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).format(post.publishedAt)}
                          </time>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
