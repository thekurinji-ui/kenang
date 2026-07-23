import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/payments/status/{orderId}
// Status pembayaran dibaca dari database.
// Perubahan status dilakukan oleh webhook Midtrans.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

  const { orderId } = await params;

  const order = await prisma.paymentOrder.findFirst({
    where: {
      orderId,
      userId: session.user.id,
    },
  });

  if (!order) {
    return NextResponse.json(
      {
        success: false,
        message: "Order tidak ditemukan",
        code: "ORDER_NOT_FOUND",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      status: order.status,
    },
  });
}
