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
  /**
   * Optional event cover photo (host-uploaded). Only used by the A4 poster,
   * which lays its content out sideways (see OLIVE design notes below) —
   * the photo gets rotated along with everything else so it reads upright
   * once the printed page itself is turned 90°.
   */
  coverImageSrc?: string | null;
}

/**
 * "Olive" design (A4 poster only, as of the 2026-07 redesign) — a landscape
 * poster: left column has title/date/QR/tagline, right column has the
 * cover photo + a "Misi Tamu" panel, footer strip runs across the bottom.
 * Story format keeps the older upright portrait layout/colors further down
 * this file (COLORS/MISSIONS/STEPS/drawCard).
 */
const OLIVE = {
  bg: "#8A9A5B",
  bgMuted: "#7C8B54",
  cream: "#F7F4EA",
  creamSoft: "rgba(247, 244, 234, 0.78)",
  creamFaint: "rgba(247, 244, 234, 0.5)",
  panel: "rgba(247, 244, 234, 0.90)",
  textDark: "#2B2E26",
  textDarkSoft: "rgba(43, 46, 38, 0.65)",
  accent: "#4A5A2E",
};

const MISSIONS_A4 = [
  "Ambil foto pasangan dari sudut favoritmu.",
  "Tangkap tawa keluarga dan sahabat.",
  "Abadikan detail dekorasi yang menarik perhatianmu.",
  "Ambil satu foto yang menurutmu paling menggambarkan hari ini.",
  "Ambil selfie dengan orang di sebelahmu.",
];

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
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draws `img` into the x/y/w/h box using object-fit: cover semantics. */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > boxRatio) {
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Greedy word-wrap, measured with the given font. */
function wrapForRotated(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxAdvance: number
): string[] {
  ctx.font = font;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxAdvance && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Dashed L-shaped corner brackets around a box — the "scan frame" look. */
function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bracketLen: number,
  color: string,
  lineWidth: number,
  outset = 12
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.setLineDash([8, 6]);

  const bx = x - outset;
  const by = y - outset;
  const bs = size + outset * 2;

  const corners: Array<[number, number, 1 | -1, 1 | -1]> = [
    [bx, by, 1, 1],
    [bx + bs, by, -1, 1],
    [bx, by + bs, 1, -1],
    [bx + bs, by + bs, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * bracketLen, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * bracketLen);
    ctx.stroke();
  }
  ctx.restore();
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

interface DrawA4OliveOpts {
  canvas: HTMLCanvasElement;
  data: QrCardData;
  qr: HTMLImageElement;
  cover: HTMLImageElement | null;
}

/**
 * Draws the redesigned A4 poster (olive/cream, "Wedding of ___" reference
 * layout) — landscape, everything upright. Canvas is 1754x1240 (A4 landscape
 * @ ~150dpi). Left column: title/date/QR/tagline. Right column: cover photo
 * + "Misi Tamu" panel. Footer strip runs across the bottom.
 */
function drawA4OliveCard({ canvas, data, qr, cover }: DrawA4OliveOpts) {
  const W = canvas.width; // 1754
  const H = canvas.height; // 1240
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = OLIVE.bg;
  ctx.fillRect(0, 0, W, H);

  // ---- Left column: title / date / QR / tagline -----------------------
  const leftX = 70;
  const leftWidth = 650;
  let y = 130;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 14px Inter, sans-serif";
  ctx.fillStyle = OLIVE.creamSoft;
  ctx.fillText("W E D D I N G   O F", leftX, y);
  y += 56;

  ctx.font = "700 54px Poppins, sans-serif";
  ctx.fillStyle = OLIVE.cream;
  const titleLines = wrapForRotated(ctx, data.eventTitle.toUpperCase(), "700 54px Poppins, sans-serif", leftWidth);
  for (const line of titleLines) {
    ctx.fillText(line, leftX, y);
    y += 60;
  }
  y += 10;

  ctx.font = "600 16px Inter, sans-serif";
  ctx.fillStyle = OLIVE.creamSoft;
  if (data.eventDateLabel) {
    ctx.fillText(data.eventDateLabel, leftX, y);
    y += 24;
  }
  if (data.eventLocation) {
    ctx.fillText(data.eventLocation, leftX, y);
    y += 24;
  }
  y += 30;

  ctx.font = "700 36px Poppins, sans-serif";
  ctx.fillStyle = OLIVE.cream;
  ctx.fillText("Scan. Jepret. Kenang.", leftX, y);
  y += 50;

  const qrSize = 400;
  const qrX = leftX;
  const qrY = y;
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 20);
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qr, qrX + 24, qrY + 24, qrSize - 48, qrSize - 48);
  drawCornerBrackets(ctx, qrX, qrY, qrSize, 40, OLIVE.cream, 3);

  ctx.textAlign = "center";
  ctx.font = "700 15px Inter, sans-serif";
  ctx.fillStyle = OLIVE.cream;
  ctx.fillText("S C A N   M E", qrX + qrSize / 2, qrY - 22);
  ctx.textAlign = "left";

  // Wordmark, bottom-left.
  ctx.font = "700 20px Poppins, sans-serif";
  ctx.fillStyle = OLIVE.cream;
  ctx.fillText("KENANG KURINJI", leftX, H - 60);

  // ---- Right column: cover photo + missions panel ----------------------
  const rightX = 780;
  const rightWidth = W - rightX - 70; // ends at 1684
  const photoX = rightX;
  const photoY = 70;
  const photoW = rightWidth;
  const photoH = 610;

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.clip();
  if (cover) {
    drawImageCover(ctx, cover, photoX, photoY, photoW, photoH);
    ctx.fillStyle = "rgba(74, 90, 46, 0.18)";
    ctx.fillRect(photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = OLIVE.bgMuted;
    ctx.fillRect(photoX, photoY, photoW, photoH);
  }
  ctx.restore();

  const panelX = rightX;
  const panelY = photoY + photoH + 40;
  const panelW = rightWidth;
  const panelH = H - panelY - 95;
  ctx.save();
  ctx.fillStyle = OLIVE.panel;
  roundRect(ctx, panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "left";
  ctx.font = "700 18px Poppins, sans-serif";
  ctx.fillStyle = OLIVE.textDark;
  ctx.fillText("MISI TAMU", panelX + 30, panelY + 34);

  const colCount = MISSIONS_A4.length;
  const colPad = 30;
  const colAreaW = panelW - colPad * 2;
  const colWidth = colAreaW / colCount;
  MISSIONS_A4.forEach((mission, i) => {
    const colX = panelX + colPad + colWidth * i;
    const numberY = panelY + 80;

    ctx.textAlign = "left";
    ctx.font = "700 30px Poppins, sans-serif";
    ctx.fillStyle = OLIVE.accent;
    ctx.fillText(String(i + 1).padStart(2, "0"), colX, numberY);
    const numW = ctx.measureText(String(i + 1).padStart(2, "0")).width;
    ctx.font = "600 16px Inter, sans-serif";
    ctx.fillText("\u2197", colX + numW + 6, numberY);

    ctx.font = "400 13px Inter, sans-serif";
    ctx.fillStyle = OLIVE.textDarkSoft;
    const descLines = wrapForRotated(ctx, mission, "400 13px Inter, sans-serif", colWidth - 24);
    let dy = numberY + 26;
    for (const line of descLines) {
      ctx.fillText(line, colX, dy);
      dy += 18;
    }
  });

  // ---- Footer strip, full width -----------------------------------------
  ctx.textAlign = "center";
  ctx.font = "700 15px Poppins, sans-serif";
  ctx.fillStyle = OLIVE.cream;
  ctx.fillText("Jumlah jepretan terbatas. Gunakan setiap foto dengan penuh makna.", W / 2, H - 58);

  ctx.font = "400 13px Inter, sans-serif";
  ctx.fillStyle = OLIVE.creamSoft;
  ctx.fillText("Terima kasih telah menjadi bagian dari kenangan hari ini.", W / 2, H - 36);

  ctx.font = "400 11px Inter, sans-serif";
  ctx.fillStyle = OLIVE.creamFaint;
  ctx.fillText("Dibuat dengan Kenang Kurinji \u00B7 KURINJI VIRTUAL NUSANTARA", W / 2, H - 16);
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
  const canvas = document.createElement("canvas");

  if (format === "a4") {
    const [qr, cover] = await Promise.all([
      loadImage(data.qrImageSrc),
      data.coverImageSrc ? loadImage(data.coverImageSrc).catch(() => null) : Promise.resolve(null),
    ]);
    await ensureFonts();
    canvas.width = 1754;
    canvas.height = 1240;
    drawA4OliveCard({ canvas, data, qr, cover });
  } else {
    const [logo, qr] = await Promise.all([loadImage("/logo.png"), loadImage(data.qrImageSrc)]);
    await ensureFonts();
    canvas.width = 1080;
    canvas.height = 1920;
    drawCard({ canvas, format, data, logo, qr });
  }

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
