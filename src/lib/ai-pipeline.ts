import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/r2";
import { getOpenAIClient } from "@/lib/openai";

// AI Features v3.0 — lihat "Kenang Kurinji 3.0 — AI Features Blueprint".
// Semua panggilan OpenAI dipusatkan di sini supaya:
// 1. Dipakai bareng oleh upload flow (async, per-foto) DAN API routes
//    (/api/ai/best-shot, /api/ai/smart-gallery) yang dipanggil manual dari
//    dashboard host untuk memproses ulang foto lama.
// 2. Best Shot scoring + Smart Gallery categorization digabung jadi SATU
//    panggilan OpenAI per foto (bukan dua) — lebih hemat biaya & latency,
//    karena keduanya sama-sama butuh "lihat" foto yang sama.

export const SMART_GALLERY_CATEGORIES = [
  "Ceremony",
  "Reception",
  "Family",
  "Friends",
  "Couple",
  "Kids",
  "Food",
  "Dance",
  "Outdoor",
  "Golden Hour",
  "Night",
] as const;

export type SmartGalleryCategory = (typeof SMART_GALLERY_CATEGORIES)[number];

interface PhotoAnalysisResult {
  score: number;
  reason: string;
  category: SmartGalleryCategory;
}

async function analyzePhotoWithAI(imageUrl: string): Promise<PhotoAnalysisResult> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah AI penilai foto acara (pernikahan, ulang tahun, gathering) untuk produk Kenang Kurinji. " +
          "Nilai foto ini (0-100) berdasarkan gabungan: blur, exposure, senyum, mata terbuka, keterlihatan wajah, " +
          "komposisi, ketajaman, dan kualitas momen secara keseluruhan. Foto momen yang hangat/emosional dengan " +
          "kualitas teknis baik dapat skor tinggi; foto blur/gelap/wajah tidak jelas dapat skor rendah. " +
          `Kategorikan juga foto ini ke TEPAT SATU dari daftar berikut: ${SMART_GALLERY_CATEGORIES.join(", ")}. ` +
          'Balas HANYA dengan JSON persis format ini, tanpa teks lain: ' +
          '{"score": <integer 0-100>, "reason": "<alasan singkat 1 kalimat, Bahasa Indonesia>", "category": "<salah satu dari daftar kategori>"}',
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analisis foto ini." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<{ score: unknown; reason: unknown; category: unknown }>;

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const reason = typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : "";
  const category = (SMART_GALLERY_CATEGORIES as readonly string[]).includes(parsed.category as string)
    ? (parsed.category as SmartGalleryCategory)
    : "Outdoor"; // fallback netral kalau AI keluar dari daftar kategori

  return { score, reason, category };
}

/**
 * Jalankan pipeline AI (Feature 1 + Feature 3) untuk SATU foto. Dipanggil
 * secara asynchronous setelah upload selesai (lihat waitUntil di
 * src/app/api/v1/uploads/route.ts) — kegagalan di sini TIDAK BOLEH
 * menggagalkan upload foto itu sendiri, karena itu best-effort di-catch.
 */
export async function runPhotoAiPipeline(photoId: string): Promise<void> {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;

  try {
    const imageUrl = publicUrl(photo.storageKey);
    const { score, reason, category } = await analyzePhotoWithAI(imageUrl);

    // Feature 3 (Smart Gallery): satu Album per kategori per event, dibuat
    // otomatis kalau belum ada (lihat @@unique([eventId, title]) di schema).
    const album = await prisma.album.upsert({
      where: { eventId_title: { eventId: photo.eventId, title: category } },
      update: {},
      create: { eventId: photo.eventId, title: category },
    });

    await prisma.photo.update({
      where: { id: photo.id },
      data: {
        aiScore: score,
        aiReason: reason,
        aiCategory: category,
        aiAnalyzedAt: new Date(),
        albumId: album.id,
      },
    });

    // Feature 1 (Best Shot): cek apakah foto ini sekarang jadi juara baru
    // di event-nya. Dilakukan tiap foto selesai dianalisis supaya badge
    // "AI Best Shot" selalu real-time, bukan cuma pas host klik tombol.
    await recomputeBestShotBadge(photo.eventId);
  } catch (err) {
    console.error(`[ai-pipeline] Gagal analisis foto ${photoId}:`, err);
  }
}

/** Tandai ulang satu foto dengan skor tertinggi di event sebagai "AI Best Shot". */
export async function recomputeBestShotBadge(eventId: string): Promise<void> {
  const top = await prisma.photo.findFirst({
    where: { eventId, aiScore: { not: null } },
    orderBy: { aiScore: "desc" },
  });
  if (!top) return;

  await prisma.$transaction([
    prisma.photo.updateMany({
      where: { eventId, id: { not: top.id }, aiIsBestShot: true },
      data: { aiIsBestShot: false },
    }),
    prisma.photo.update({ where: { id: top.id }, data: { aiIsBestShot: true } }),
  ]);
}

/**
 * Feature 2 (AI Story): generate narasi 100-300 kata dari metadata event +
 * beberapa foto dengan skor Best Shot tertinggi (fallback ke foto terbaru
 * kalau belum ada foto yang dianalisis AI sama sekali).
 */
export async function generateEventStory(eventId: string): Promise<string> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { analytics: true },
  });
  if (!event) throw new Error("Event tidak ditemukan");

  let topPhotos = await prisma.photo.findMany({
    where: { eventId, aiScore: { not: null } },
    orderBy: { aiScore: "desc" },
    take: 6,
  });

  if (topPhotos.length === 0) {
    topPhotos = await prisma.photo.findMany({
      where: { eventId },
      orderBy: { uploadedAt: "desc" },
      take: 6,
    });
  }

  const client = getOpenAIClient();

  const imageContent = topPhotos.map((p) => ({
    type: "image_url" as const,
    image_url: { url: publicUrl(p.storageKey) },
  }));

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 600,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah penulis narasi untuk Kenang Kurinji, produk kamera disposable digital untuk acara " +
          "(pernikahan, ulang tahun, gathering). Tulis SATU cerita singkat 100-300 kata dalam Bahasa Indonesia, " +
          "bergaya hangat, puitis, dan emosional — sesuai identitas brand Kenang Kurinji ('Scan. Jepret. Kenang.'). " +
          "Tulis sebagai narasi mengalir (bukan poin-poin/list), rangkum suasana dan momen acara berdasarkan info " +
          "dan foto yang diberikan. Jangan mengarang detail spesifik (nama tamu, dsb) yang tidak ada di data.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              `Nama event: ${event.title}\n` +
              `Tanggal: ${event.eventDate ? event.eventDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "tidak diketahui"}\n` +
              `Lokasi: ${event.location ?? "tidak diketahui"}\n` +
              `Jumlah tamu: ${event.analytics?.totalGuests ?? "tidak diketahui"}`,
          },
          ...imageContent,
        ],
      },
    ],
  });

  const story = response.choices[0]?.message?.content?.trim() ?? "";

  await prisma.event.update({
    where: { id: eventId },
    data: { aiStory: story, aiStoryGeneratedAt: new Date() },
  });

  return story;
                         }
