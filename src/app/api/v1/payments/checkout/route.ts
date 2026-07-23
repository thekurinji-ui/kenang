import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSnapTransaction } from "@/lib/midtrans";
import { isCheckoutPlan, PLAN_LIMITS } from "@/lib/plans";

const PLAN_PRICES = {
  KINCI: 0,
  KURINJI: 49000,
  GUNUNG_TUJUH: 99000,
  GUNUNG_KERINCI: 199000,
} as const;

// POST /api/v1/payments/checkout
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Silakan login",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan;

  if (!isCheckoutPlan(plan)) {
    return NextResponse.json(
      {
        success: false,
        message: "Plan tidak valid",
        code: "INVALID_PLAN",
      },
      { status: 422 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User tidak ditemukan",
        code: "USER_NOT_FOUND",
      },
      { status: 404 }
    );
  }

  const amount = PLAN_PRICES[plan];
  const orderId = `${plan}-${crypto.randomUUID()}`;

  const order = await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      orderId,
      plan,
      amount,
      status: "PENDING",
    },
  });

  try {
    const transaction = await createSnapTransaction({
      orderId,
      grossAmount: amount,
      customerName: user.name ?? "Customer",
      customerEmail: user.email ?? "",
      itemName: `Kenang Kurinji — Upgrade Plan ${PLAN_LIMITS[plan].name}`,
    });

    if (!transaction.ok) {
      throw new Error(transaction.reason);
    }

    await prisma.paymentOrder.update({
      where: {
        id: order.id,
      },
      data: {
        snapToken: transaction.token,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token: transaction.token,
        redirectUrl: transaction.redirectUrl,
        orderId,
      },
    });
  } catch (error) {
    console.error(error);

    await prisma.paymentOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat transaksi pembayaran.",
        code: "PAYMENT_GATEWAY_ERROR",
      },
      { status: 502 }
    );
  }
      }
