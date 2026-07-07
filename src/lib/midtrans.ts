import midtransClient from "midtrans-client";
import { PLAN_LIMITS, type CheckoutPlan } from "@/lib/plans";

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

export const PLAN_PRICES: Record<CheckoutPlan, number> = {
  KURINJI: PLAN_LIMITS.KURINJI.price!,
  GUNUNG_TUJUH: PLAN_LIMITS.GUNUNG_TUJUH.price!,
};

export function generateOrderId(plan: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `KK-${plan}-${Date.now()}-${random}`;
}
