-- AlterTable
ALTER TABLE "events" ADD COLUMN "guest_count" INTEGER NOT NULL DEFAULT 0;

-- Backfill: isi guest_count untuk event yang sudah ada dari jumlah baris
-- guests yang sudah tercatat, supaya event lama tidak mulai dari 0 padahal
-- sudah punya tamu.
UPDATE "events" e
SET "guest_count" = (
  SELECT COUNT(*) FROM "guests" g WHERE g."event_id" = e."id"
);
