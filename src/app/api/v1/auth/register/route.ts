import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { computeExpiresAt } from "@/lib/plans";

// POST /api/v1/auth/register — Volume 7 (Authentication API)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

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

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "Email sudah terdaftar", code: "EMAIL_TAKEN" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      subscription: { create: { plan: "KINCAI", expiresAt: computeExpiresAt("KINCAI") } },
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ success: true, data: user }, { status: 201 });
}
