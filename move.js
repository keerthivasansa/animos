const { renameSync, rmSync } = require("fs");
const { execSync } = require("child_process");
const { config } = require("dotenv");

let args = process.argv.slice(2);
config();

if (args[0] == "back") {
  console.log("Removing production db file . .");
  rmSync("prisma/cache.db");
  console.log("Loading old dev db file . .");
  renameSync("prisma/cache.db.bk", "prisma/cache.db");
} else {
  if (process.env.NODE_ENV != "production") {
    console.log("Renaming db file. . .");
    renameSync("prisma/cache.db", "prisma/cache.db.bk");
  } else {
    console.log("Production detected, skipping rename");
  }
  console.log("Executing prisma deploy. . .");
  execSync("npx prisma migrate deploy");
}
