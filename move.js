const { renameSync, rmSync } = require("fs");
const { execSync } = require("child_process");

let args = process.argv.slice(2);

if (args[0] == 'back') {
    rmSync("prisma/cache.db");
    renameSync("prisma/cache.db.bk", "prisma/cache.db")
} else {
    renameSync("prisma/cache.db", "prisma/cache.db.bk")
    execSync("npx prisma migrate deploy");
}