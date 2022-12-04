import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { app } from "electron";

let appPath = app.getPath("userData");

console.log({ appPath });

export const db =  new PrismaClient();
