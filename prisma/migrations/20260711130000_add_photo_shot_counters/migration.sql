-- AlterTable
ALTER TABLE "events" ADD COLUMN "photo_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "guests" ADD COLUMN "shot_count" INTEGER NOT NULL DEFAULT 0;

-- Backfill: isi photo_count & shot_count dari foto yang sudah ada, supaya
-- event/guest lama tidak mulai dari 0 padahal sudah punya foto.
UPDATE "events" e
SET "photo_count" = (
  SELECT COUNT(*) FROM "photos" p WHERE p."event_id" = e."id"
);

UPDATE "guests" g
SET "shot_count" = (
  SELECT COUNT(*) FROM "photos" p WHERE p."guest_id" = g."id"
);
