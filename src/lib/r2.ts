import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// Cloudflare R2 adalah S3-compatible, jadi kita pakai @aws-sdk/client-s3
// biasa dengan endpoint R2. Env vars (lihat .env.example):
// R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET, R2_PUBLIC_URL

const R2_BUCKET = process.env.R2_BUCKET!;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

/** Upload buffer ke R2. Key contoh: events/{eventId}/original/{filename} */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/** Hapus satu object dari R2. Aman dipanggil walau object sudah tidak ada. */
export async function deleteObject(key: string) {
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    // best-effort — object mungkin sudah tidak ada, DB tetap source of truth
  }
}

/** Ambil isi object sebagai Buffer (dipakai buat ZIP export). */
export async function getObjectBuffer(key: string): Promise<Buffer | null> {
  try {
    const res = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const stream = res.Body as unknown as AsyncIterable<Uint8Array>;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

/** Ukuran object dalam bytes, buat update Analytics.storageUsed saat delete. */
export async function getObjectSize(key: string): Promise<number> {
  try {
    const res = await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return res.ContentLength ?? 0;
  } catch {
    return 0;
  }
}

/** URL publik lengkap dari storage key, buat ditampilkan di <img> dsb. */
export function publicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}
