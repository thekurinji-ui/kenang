import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ZipFile } from "yazl";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getObjectBuffer } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/events/{id}/export — download semua foto event sebagai ZIP
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session.user.id, deletedAt: null },
  });
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const photos = await prisma.photo.findMany({
    where: { eventId: event.id },
    orderBy: { uploadedAt: "asc" },
    include: { guest: { select: { nickname: true } } },
  });

  if (photos.length === 0) {
    return NextResponse.json(
      { success: false, message: "Belum ada foto untuk diunduh", code: "NO_PHOTOS" },
      { status: 404 }
    );
  }

  const zipfile = new ZipFile();
  const usedNames = new Set<string>();

  for (const photo of photos) {
    const buffer = await getObjectBuffer(photo.storageKey);
    if (!buffer) {
      continue; // skip missing files, best-effort export
    }

    const ext = path.extname(photo.storageKey) || ".jpg";
    const guestName =
      (photo.guest?.nickname ?? "tamu")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .slice(0, 30) || "tamu";
    const dateLabel = photo.uploadedAt.toISOString().slice(0, 10);

    const baseName = `${dateLabel}_${guestName}`;
    let entryName = `${baseName}${ext}`;
    let counter = 1;
    while (usedNames.has(entryName)) {
      entryName = `${baseName}_${counter}${ext}`;
      counter += 1;
    }
    usedNames.add(entryName);

    zipfile.addBuffer(buffer, entryName);
  }

  zipfile.end();

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    zipfile.outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    zipfile.outputStream.on("end", () => resolve());
    zipfile.outputStream.on("error", reject);
  });
  const zipBuffer = Buffer.concat(chunks);

  const safeTitle = event.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "event";
  const filename = `${safeTitle}-kenangkurinji.zip`;

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
