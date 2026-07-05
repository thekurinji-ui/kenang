import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

// POST /api/v1/auth/reset-password — submit password baru pakai token dari email
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

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

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Link reset password tidak valid atau sudah kedaluwarsa.",
        code: "INVALID_TOKEN",
      },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Password berhasil diubah. Silakan login dengan password baru.",
  });
}
