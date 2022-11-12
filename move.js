const { renameSync, rmSync } = require("fs");
const { execSync } = require("child_process");
const { config } = require("dotenv");

let args = process.argv.slice(2);
config();

if (args[0] == "back") {
  rmSync("prisma/cache.db");
  renameSync("prisma/cache.db.bk", "prisma/cache.db");
} else {
  console.log({ env: process.env.NODE_ENV });
  if (process.env.NODE_ENV != "production")
    renameSync("prisma/cache.db", "prisma/cache.db.bk");
  execSync("npx prisma migrate deploy");
}
