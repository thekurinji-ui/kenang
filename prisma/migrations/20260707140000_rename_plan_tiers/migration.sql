-- Kenang Kurinji v2.1 — rename plan tiers to match Subscription Blueprint
-- FREE -> KINCAI, PLUS -> KURINJI, PRO -> GUNUNG_TUJUH, BUSINESS -> GUNUNG_KERINCI
-- Data existing tetap aman: ini rename value, bukan drop/create ulang.

ALTER TYPE "SubscriptionPlan" RENAME TO "Plan";

ALTER TYPE "Plan" RENAME VALUE 'FREE' TO 'KINCAI';
ALTER TYPE "Plan" RENAME VALUE 'PLUS' TO 'KURINJI';
ALTER TYPE "Plan" RENAME VALUE 'PRO' TO 'GUNUNG_TUJUH';
ALTER TYPE "Plan" RENAME VALUE 'BUSINESS' TO 'GUNUNG_KERINCI';

-- renewAt -> expiresAt (merepresentasikan masa aktif plan: 30 hari untuk
-- Kincai, 1 tahun untuk Kurinji/Gunung Tujuh, tanpa batas untuk Gunung Kerinci)
ALTER TABLE "subscriptions" RENAME COLUMN "renew_at" TO "expires_at";
