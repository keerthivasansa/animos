import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { app } from "electron";

let appPath = app.getPath("userData");

console.log({ appPath });

export const db = app.isPackaged
  ? new PrismaClient({
      datasources: {
        db: {
          url: join(appPath, "Animos", "cache.db"),
        },
      },
    })
  : new PrismaClient();
