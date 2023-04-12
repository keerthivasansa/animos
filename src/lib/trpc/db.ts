import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
export const db = new PrismaClient();
