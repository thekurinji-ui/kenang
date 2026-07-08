/**
 * Client-side canvas renderer for the "Kartu QR" download — a print/share-ready
 * card that already includes event branding, guest instructions, and the QR
 * code, so the host can download one file and use it as-is (no extra editing).
 *
 * Runs entirely in the browser (Canvas 2D) — no server dependency, keeps this
 * cheap to run on Vercel.
 */

export type QrCardFormat = "a4" | "story";

export interface QrCardData {
  eventTitle: string;
  eventDateLabel: string | null; // e.g. "Sabtu, 14 Februari 2026" — already formatted
  eventLocation: string | null;
  qrImageSrc: string; // data URL from /api/v1/events/{id}/qr
}

const COLORS = {
  bg: "#FAFAFA",
  midnight: "#111827",
  midnightSoft: "rgba(17, 24, 39, 0.65)",
  midnightFaint: "rgba(17, 24, 39, 0.45)",
  crimson: "#D62828",
  gold: "#FBBF24",
  slate: "#E5E7EB",
};

const MISSIONS = [
  "Ambil foto pasangan dari sudut favoritmu.",
  "Tangkap tawa keluarga dan sahabat.",
  "Abadikan detail dekorasi yang menarik perhatianmu.",
  "Temukan momen yang mungkin terlewat oleh fotografer resmi.",
  "Ambil satu foto yang menurutmu paling menggambarkan hari ini.",
];

const STEPS = [
  "Scan QR Code di bawah ini.",
  "Izinkan akses kamera.",
  "Ambil foto sesuai jumlah jepretan yang tersedia.",
  "Foto akan otomatis tersimpan ke galeri acara.",
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load("700 40px Poppins"),
      document.fonts.load("600 24px Poppins"),
      document.fonts.load("600 16px Poppins"),
      document.fonts.load("400 16px Inter"),
      document.fonts.load("600 16px Inter"),
      document.fonts.ready,
    ]);
  } catch {
    // Font loading is best-effort — canvas will fall back to system fonts.
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws centered, word-wrapped text. Returns the y position after the block. */
function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, centerX, cursorY);
      line = words[i];
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, centerX, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function drawDiamondDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, width: number) {
  ctx.strokeStyle = COLORS.slate;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, y);
  ctx.lineTo(cx - 14, y);
  ctx.moveTo(cx + 14, y);
  ctx.lineTo(cx + width / 2, y);
  ctx.stroke();

  ctx.fillStyle = COLORS.gold;
  ctx.font = "600 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u2726", cx, y + 1);
}

interface DrawOpts {
  canvas: HTMLCanvasElement;
  format: QrCardFormat;
  data: QrCardData;
  logo: HTMLImageElement;
  qr: HTMLImageElement;
}

function drawCard({ canvas, format, data, logo, qr }: DrawOpts) {
  const isA4 = format === "a4";
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const s = W / (isA4 ? 1240 : 1080); // scale factor relative to design baseline

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const pad = 92 * s;
  const contentWidth = W - pad * 2;
  let y = 108 * s;

  // Event title
  ctx.fillStyle = COLORS.midnight;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${(isA4 ? 38 : 32) * s}px Poppins, sans-serif`;
  y = wrapCenteredText(ctx, data.eventTitle.toUpperCase(), cx, y, contentWidth, (isA4 ? 46 : 40) * s);

  // Date / location
  y += 8 * s;
  ctx.font = `400 ${15 * s}px Inter, sans-serif`;
  ctx.fillStyle = COLORS.midnightSoft;
  if (data.eventDateLabel) {
    ctx.fillText(data.eventDateLabel, cx, y);
    y += 22 * s;
  }
  if (data.eventLocation) {
    ctx.fillText(data.eventLocation, cx, y);
    y += 22 * s;
  }

  y += 20 * s;
  drawDiamondDivider(ctx, cx, y, contentWidth);
  y += 46 * s;

  // Brand row
  const logoH = (isA4 ? 34 : 28) * s;
  const logoW = (logo.width / logo.height) * logoH;
  ctx.drawImage(logo, cx - logoW / 2, y - logoH, logoW, logoH);
  y += 26 * s;

  ctx.font = `600 ${13 * s}px Poppins, sans-serif`;
  ctx.fillStyle = COLORS.crimson;
  ctx.fillText("S C A N   \u00B7   J E P R E T   \u00B7   K E N A N G", cx, y);
  y += 26 * s;

  if (isA4) {
    ctx.font = `400 ${13.5 * s}px Inter, sans-serif`;
    ctx.fillStyle = COLORS.midnightSoft;
    y = wrapCenteredText(
      ctx,
      "Setiap momen hari ini hanya terjadi satu kali. Bantu abadikan cerita dari sudut pandangmu.",
      cx,
      y,
      contentWidth * 0.72,
      20 * s
    );
  }

  y += 16 * s;
  drawDiamondDivider(ctx, cx, y, contentWidth);
  y += 44 * s;

  // Misi Tamu — full card (A4) only; Story keeps it short per approved layout
  if (isA4) {
    ctx.font = `600 ${16 * s}px Poppins, sans-serif`;
    // Draw "MISI" + "TAMU" (crimson) as one centered line
    {
      const a = "MISI ";
      const b = "TAMU";
      const totalWidth = ctx.measureText(a + b).width;
      const startX = cx - totalWidth / 2;
      ctx.textAlign = "left";
      ctx.fillStyle = COLORS.midnight;
      ctx.fillText(a, startX, y);
      ctx.fillStyle = COLORS.crimson;
      ctx.fillText(b, startX + ctx.measureText(a).width, y);
      ctx.textAlign = "center";
    }
    y += 30 * s;

    const missionBoxSize = 15 * s;
    const missionMaxWidth = 460 * s;
    const missionLeft = cx - missionMaxWidth / 2;
    ctx.font = `400 ${14 * s}px Inter, sans-serif`;
    for (const mission of MISSIONS) {
      ctx.strokeStyle = COLORS.crimson;
      ctx.lineWidth = 1.4;
      roundRect(ctx, missionLeft, y - missionBoxSize + 2, missionBoxSize, missionBoxSize, 3 * s);
      ctx.stroke();

      ctx.fillStyle = COLORS.midnight;
      ctx.textAlign = "left";
      ctx.fillText(mission, missionLeft + missionBoxSize + 10 * s, y);
      ctx.textAlign = "center";
      y += 27 * s;
    }

    y += 14 * s;
    drawDiamondDivider(ctx, cx, y, contentWidth);
    y += 40 * s;
  }

  // Cara Menggunakan
  {
    const a = "CARA ";
    const b = "MENGGUNAKAN";
    ctx.font = `600 ${(isA4 ? 16 : 14) * s}px Poppins, sans-serif`;
    const totalWidth = ctx.measureText(a + b).width;
    const startX = cx - totalWidth / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.midnight;
    ctx.fillText(a, startX, y);
    ctx.fillStyle = COLORS.crimson;
    ctx.fillText(b, startX + ctx.measureText(a).width, y);
    ctx.textAlign = "center";
  }
  y += (isA4 ? 34 : 28) * s;

  const drawStep = (num: number, text: string) => {
    const r = 12 * s;
    ctx.font = `400 ${14 * s}px Inter, sans-serif`;
    const textWidth = Math.min(ctx.measureText(text).width, contentWidth * 0.75);
    const groupWidth = r * 2 + 10 * s + textWidth;
    const startX = cx - groupWidth / 2;

    ctx.fillStyle = COLORS.midnight;
    ctx.beginPath();
    ctx.arc(startX + r, y - r + 4 * s, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bg;
    ctx.font = `600 ${11 * s}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(String(num), startX + r, y + 4 * s);

    ctx.fillStyle = COLORS.midnight;
    ctx.font = `400 ${14 * s}px Inter, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(text, startX + r * 2 + 10 * s, y);
    ctx.textAlign = "center";
    y += 30 * s;
  };

  if (isA4) {
    drawStep(1, STEPS[0]);
  } else {
    ctx.font = `400 ${14 * s}px Inter, sans-serif`;
    ctx.fillStyle = COLORS.midnight;
    ctx.fillText(STEPS[0], cx, y);
    y += 30 * s;
  }

  // QR box
  const qrBoxSize = (isA4 ? 220 : 210) * s;
  const qrPad = 20 * s;
  const boxTotal = qrBoxSize + qrPad * 2;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cx - boxTotal / 2, y, boxTotal, boxTotal, 16 * s);
  ctx.fill();
  ctx.strokeStyle = COLORS.crimson;
  ctx.lineWidth = 2 * s;
  roundRect(ctx, cx - boxTotal / 2, y, boxTotal, boxTotal, 16 * s);
  ctx.stroke();
  ctx.drawImage(qr, cx - qrBoxSize / 2, y + qrPad, qrBoxSize, qrBoxSize);
  y += boxTotal + 34 * s;

  if (isA4) {
    drawStep(2, STEPS[1]);
    drawStep(3, STEPS[2]);
    drawStep(4, STEPS[3]);
  } else {
    ctx.font = `400 ${13.5 * s}px Inter, sans-serif`;
    ctx.fillStyle = COLORS.midnight;
    y = wrapCenteredText(
      ctx,
      "Izinkan akses kamera \u2192 jepret sesuai kuota \u2192 otomatis masuk galeri acara.",
      cx,
      y,
      contentWidth * 0.82,
      19 * s
    );
  }

  // Footer — pinned near the bottom
  const footerY = H - (isA4 ? 96 : 84) * s;
  ctx.font = `600 ${13 * s}px Poppins, sans-serif`;
  ctx.fillStyle = COLORS.midnight;
  ctx.fillText("Jumlah jepretan terbatas. Gunakan setiap foto dengan penuh makna.", cx, footerY);

  ctx.font = `400 ${12 * s}px Inter, sans-serif`;
  ctx.fillStyle = COLORS.midnightSoft;
  ctx.fillText("Terima kasih telah menjadi bagian dari kenangan hari ini.", cx, footerY + 20 * s);

  ctx.font = `400 ${10.5 * s}px Inter, sans-serif`;
  ctx.fillStyle = COLORS.midnightFaint;
  ctx.fillText(
    "Dibuat dengan cinta oleh kenang.kurinji.asia \u00B7 KURINJI VIRTUAL NUSANTARA",
    cx,
    H - 40 * s
  );
}

export async function generateQrCardBlob(format: QrCardFormat, data: QrCardData): Promise<Blob> {
  const [logo, qr] = await Promise.all([loadImage("/logo.png"), loadImage(data.qrImageSrc)]);
  await ensureFonts();

  const canvas = document.createElement("canvas");
  if (format === "a4") {
    canvas.width = 1240;
    canvas.height = 1754;
  } else {
    canvas.width = 1080;
    canvas.height = 1920;
  }

  drawCard({ canvas, format, data, logo, qr });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gagal membuat gambar kartu QR"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
