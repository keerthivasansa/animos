import { app } from "electron";
import { fork } from "node:child_process";
import { resolve, join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { db, dbPath } from ".";

const platformToExecutables = {
  win32: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-windows.exe",
    queryEngine: "node_modules/@prisma/engines/query_engine-windows.dll.node",
  },
  linux: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-debian-openssl-3.0.x",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node",
  },
  darwin: {
    migrationEngine: "node_modules/@prisma/engines/migration-engine-darwin",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin.dylib.node",
  },
  darwinArm64: {
    migrationEngine:
      "node_modules/@prisma/engines/migration-engine-darwin-arm64",
    queryEngine:
      "node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node",
  },
};

function getPlatform() {
  const isDarwin = process.platform === "darwin";
  if (isDarwin && process.arch === "arm64") {
    return process.platform + "Arm64";
  }
  return process.platform;
}

const currentPlatform = getPlatform();

function getPath(path: string) {
  if (!app.isPackaged) return resolve(path);
  return resolve(__dirname, "..", "..", path).replace(
    "app.asar",
    "app.asar.unpacked"
  ).replace("@prisma", "prisma");
}

export const migrationEnginePath = getPath(
  platformToExecutables[currentPlatform].migrationEngine
);

export const queryEnginePath = getPath(
  platformToExecutables[currentPlatform].queryEngine
);

export async function migratePrisma() {
  console.log("Applying migrations to file:", dbPath);
  console.log(__dirname);
  const prismaPath = getPath("node_modules/prisma/build/index.js");
  console.log("Prisma path:", prismaPath);
  const commands = app.isPackaged
    ? [
      "migrate",
      "deploy",
      "--schema",
      resolve("resources/prisma/schema.prisma"),
    ]
    : ["migrate", "dev"];
  const child = fork(prismaPath, commands, {
    stdio: "pipe",
    env: {
      DATABASE_URL: "file:" + dbPath,
      PRISMA_MIGRATION_ENGINE_BINARY: migrationEnginePath,
      PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,

      // Prisma apparently needs a valid path for the format and introspection binaries, even though
      // we don't use them. So we just point them to the query engine binary. Otherwise, we get
      // prisma:  Error: ENOTDIR: not a directory, unlink '/some/path/electron-prisma-trpc-example/packed/mac-arm64/ElectronPrismaTrpcExample.app/Contents/Resources/app.asar/node_modules/@prisma/engines/prisma-fmt-darwin-arm64'
      PRISMA_FMT_BINARY: queryEnginePath,
      PRISMA_INTROSPECTION_ENGINE_BINARY: queryEnginePath,
    },
  });

  child.stdout?.on("data", (data) => {
    console.log(data.toString());
  });

  child.stderr?.on("data", (data) => {
    console.log(data.toString());
  });
}

export async function needsMigration() {
  let dbExists = existsSync(dbPath);
  console.log("Database exists:", dbExists);
  if (dbExists) {
    let migrations: any =
      await db.$queryRaw`SELECT migration_name FROM _prisma_migrations order by finished_at desc`;
    let latest_db = migrations[0].migration_name;
    let latest_file = getLatestMigration();
    console.log({ latest_db, latest_file });
    return latest_db != latest_file;
  }
  return true;
}

console.log({ resourcePath: process.resourcesPath });

function getLatestMigration() {
  let files = readdirSync(
    app.isPackaged ? join(process.resourcesPath, "/prisma/migrations") : "./prisma/migrations"
  );
  files.pop();
  return files.pop();
}
