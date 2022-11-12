-- CreateTable
CREATE TABLE "Poster" (
    "created" DATETIME NOT NULL,
    "malId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "score" REAL NOT NULL
);
