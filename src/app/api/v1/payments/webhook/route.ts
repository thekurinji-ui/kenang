import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expected = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return expected === signatureKey;
}

// POST /api/v1/payments/webhook — notifikasi status transaksi dari Midtrans
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, message: "Payload tidak valid" }, { status: 400 });
  }

  const {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
    fraud_status: fraudStatus,
    payment_type: paymentType,
    transaction_id: transactionId,
  } = body;

  if (
    !orderId ||
    !statusCode ||
    !grossAmount ||
    !signatureKey ||
    !verifySignature(orderId, statusCode, grossAmount, signatureKey)
  ) {
    return NextResponse.json({ success: false, message: "Signature tidak valid" }, { status: 403 });
  }

  const order = await prisma.paymentOrder.findUnique({ where: { orderId } });
  if (!order) {
    return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
  }

  let nextStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELED" = order.status;

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    nextStatus = fraudStatus === "deny" ? "FAILED" : "PAID";
  } else if (transactionStatus === "pending") {
    nextStatus = "PENDING";
  } else if (transactionStatus === "deny") {
    nextStatus = "FAILED";
  } else if (transactionStatus === "cancel") {
    nextStatus = "CANCELED";
  } else if (transactionStatus === "expire") {
    nextStatus = "EXPIRED";
  }

  await prisma.paymentOrder.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      paymentType: paymentType ?? order.paymentType,
      transactionId: transactionId ?? order.transactionId,
      paidAt: nextStatus === "PAID" ? new Date() : order.paidAt,
    },
  });

  if (nextStatus === "PAID") {
    await prisma.subscription.upsert({
      where: { userId: order.userId },
      update: { plan: order.plan, status: "ACTIVE" },
      create: { userId: order.userId, plan: order.plan, status: "ACTIVE" },
    });
  }

  return NextResponse.json({ success: true });
}
