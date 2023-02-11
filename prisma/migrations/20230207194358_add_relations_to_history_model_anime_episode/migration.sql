-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_animeKitsuId_episodeNumber_fkey" FOREIGN KEY ("animeKitsuId", "episodeNumber") REFERENCES "Episode"("animeKitsuId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_animeKitsuId_fkey" FOREIGN KEY ("animeKitsuId") REFERENCES "Anime"("kitsuId") ON DELETE RESTRICT ON UPDATE CASCADE;
