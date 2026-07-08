import { prisma } from "@/lib/prisma";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** Ensures the slug is unique by appending a short suffix on collision.
 *  Slugs double as the guest-facing event code (Volume 3: /e/{eventCode}). */
export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "event";
  let candidate = base;
  let attempt = 0;

  while (await prisma.event.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 10) throw new Error("Gagal membuat slug unik");
  }

  return candidate;
}

/** Sama seperti generateUniqueSlug, tapi untuk artikel blog (tabel terpisah). */
export async function generateUniqueBlogSlug(title: string): Promise<string> {
  const base = slugify(title) || "artikel";
  let candidate = base;
  let attempt = 0;

  while (await prisma.blogPost.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 10) throw new Error("Gagal membuat slug artikel unik");
  }

  return candidate;
}
