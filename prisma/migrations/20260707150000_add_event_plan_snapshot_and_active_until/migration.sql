-- Kenang Kurinji v2.1 — Enforcement limit: snapshot plan per Event + masa aktif
--
-- `plan` = plan pemilik saat event dibuat (dipakai untuk cek maxGuests/maxPhotos/
-- maxVideos/rollFilmOptions event ini secara konsisten, walau host upgrade/
-- downgrade subscription belakangan).
-- `active_until` = createdAt + activeDays plan (null = tanpa batas waktu,
-- khusus Gunung Kerinci). Event lama (sebelum migrasi ini) diisi KINCAI +
-- created_at + 30 hari sebagai default aman.

ALTER TABLE "events" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'KINCAI';
ALTER TABLE "events" ADD COLUMN "active_until" TIMESTAMP(3);

UPDATE "events" SET "active_until" = "created_at" + INTERVAL '30 days' WHERE "active_until" IS NULL;
