import { PrismaClient } from "@prisma/client";
import { app } from "electron";
import { join } from "node:path";

const appPath = app.getPath("userData");
export const dbPath = join(appPath, "data.db");
console.log("Database path:", dbPath);
process.env.DATABASE_URL = dbPath;

console.log({ dbPath });
export const db = new PrismaClient({
  datasources: {
    db: {
      url: "file:" + dbPath,
    },
  },
});
