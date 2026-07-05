import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
});

// GET /api/v1/users/me
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: user });
}

// PATCH /api/v1/users/me — update nama dan/atau password
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
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

  const { name, currentPassword, newPassword } = parsed.data;
  const data: { name?: string; passwordHash?: string } = {};

  if (name) data.name = name;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Masukkan password lama untuk mengganti password",
          code: "CURRENT_PASSWORD_REQUIRED",
        },
        { status: 422 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Akun ini tidak punya password lokal", code: "NO_PASSWORD" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Password lama salah", code: "INVALID_PASSWORD" },
        { status: 400 }
      );
    }

    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
