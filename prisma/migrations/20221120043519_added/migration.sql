-- CreateTable
CREATE TABLE "Genre" (
    "malId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
