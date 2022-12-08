import { app } from "electron";
import winston from "winston";
import { join } from "path";

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: app.isPackaged
        ? join(app.getPath("documents"), "Animos", "log.txt")
        : "log.txt",
    }),
  ],
});