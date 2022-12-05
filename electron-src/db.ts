import { PrismaClient } from "@prisma/client";
import { app } from "electron";
import { logger } from "./utils";

let appPath = app.getPath("userData");
console.log({ appPath });
logger.info("AppPath: " + appPath);

export const db = new PrismaClient();
