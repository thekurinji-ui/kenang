import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const PLAN_PRICES: Record<"PLUS" | "PRO", number> = {
  PLUS: 99_000,
  PRO: 299_000,
};

export function generateOrderId(plan: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `KK-${plan}-${Date.now()}-${random}`;
}
