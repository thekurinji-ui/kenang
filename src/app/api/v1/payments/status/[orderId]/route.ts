import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";

// GET /api/v1/payments/status/{orderId} — cek status transaksi (fallback jika webhook belum sampai)
export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const order = await prisma.paymentOrder.findFirst({
    where: { orderId: params.orderId, userId: session.user.id },
  });
  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order tidak ditemukan", code: "ORDER_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (order.status === "PENDING") {
    try {
      const status = await coreApi.transaction.status(order.orderId);
      const transactionStatus = status.transaction_status as string;
      const fraudStatus = status.fraud_status as string | undefined;

      let nextStatus: typeof order.status = order.status;
      if (transactionStatus === "capture" || transactionStatus === "settlement") {
        nextStatus = fraudStatus === "deny" ? "FAILED" : "PAID";
      } else if (transactionStatus === "deny") {
        nextStatus = "FAILED";
      } else if (transactionStatus === "cancel") {
        nextStatus = "CANCELED";
      } else if (transactionStatus === "expire") {
        nextStatus = "EXPIRED";
      }

      if (nextStatus !== order.status) {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: nextStatus,
            paymentType: status.payment_type ?? order.paymentType,
            transactionId: status.transaction_id ?? order.transactionId,
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

        return NextResponse.json({ success: true, data: { status: nextStatus } });
      }
    } catch {
      // Belum ada transaksi di Midtrans (mis. user belum bayar) — biarkan status PENDING
    }
  }

  return NextResponse.json({ success: true, data: { status: order.status } });
}
