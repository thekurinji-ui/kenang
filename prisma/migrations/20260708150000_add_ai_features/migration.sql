-- AI Features v3.0 (Best Shot, Story, Smart Gallery)

ALTER TABLE "events" ADD COLUMN "ai_story" TEXT;
ALTER TABLE "events" ADD COLUMN "ai_story_generated_at" TIMESTAMP(3);

ALTER TABLE "photos" ADD COLUMN "ai_score" INTEGER;
ALTER TABLE "photos" ADD COLUMN "ai_reason" TEXT;
ALTER TABLE "photos" ADD COLUMN "ai_is_best_shot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "photos" ADD COLUMN "ai_category" TEXT;
ALTER TABLE "photos" ADD COLUMN "ai_analyzed_at" TIMESTAMP(3);

CREATE INDEX "photos_event_id_ai_score_idx" ON "photos"("event_id", "ai_score");

CREATE UNIQUE INDEX "albums_event_id_title_key" ON "albums"("event_id", "title");
