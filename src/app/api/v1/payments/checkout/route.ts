import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap, PLAN_PRICES, generateOrderId } from "@/lib/midtrans";

const UPGRADABLE_PLANS = ["PLUS", "PRO"] as const;
type UpgradablePlan = (typeof UPGRADABLE_PLANS)[number];

function isUpgradablePlan(value: unknown): value is UpgradablePlan {
  return UPGRADABLE_PLANS.includes(value as UpgradablePlan);
}

// POST /api/v1/payments/checkout — buat transaksi Midtrans Snap untuk upgrade plan
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = body.plan;
  if (!isUpgradablePlan(plan)) {
    return NextResponse.json(
      { success: false, message: "Plan tidak valid", code: "INVALID_PLAN" },
      { status: 422 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User tidak ditemukan", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const amount = PLAN_PRICES[plan];
  const orderId = generateOrderId(plan);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: [
        {
          id: `plan-${plan.toLowerCase()}`,
          price: amount,
          quantity: 1,
          name: `Kenang Kurinji — Upgrade Plan ${plan}`,
        },
      ],
      callbacks: {
        finish: `${appUrl}/dashboard/subscription?checkout=finish`,
        error: `${appUrl}/dashboard/subscription?checkout=error`,
        pending: `${appUrl}/dashboard/subscription?checkout=pending`,
      },
    });

    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { snapToken: transaction.token },
    });

    return NextResponse.json({
      success: true,
      data: { token: transaction.token, redirectUrl: transaction.redirect_url, orderId },
    });
  } catch (error) {
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat transaksi pembayaran. Coba lagi nanti.",
        code: "PAYMENT_GATEWAY_ERROR",
      },
      { status: 502 }
    );
  }
}
