import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 jam

// POST /api/v1/auth/forgot-password — minta link reset password lewat email
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Data tidak valid",
        code: "VALIDATION_ERROR",
      },
      { status: 422 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Selalu balas sukses walau user gak ketemu, biar orang gak bisa
  // dipakai buat nebak-nebak email mana yang terdaftar (enumeration).
  if (!user || !user.passwordHash) {
    return NextResponse.json({
      success: true,
      message: "Kalau email terdaftar, link reset password sudah dikirim.",
    });
  }

  // Bersihkan token lama milik user ini biar gak numpuk
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Password — Kenang Kurinji",
    html: passwordResetEmailHtml(resetUrl),
  });

  return NextResponse.json({
    success: true,
    message: "Kalau email terdaftar, link reset password sudah dikirim.",
  });
}
