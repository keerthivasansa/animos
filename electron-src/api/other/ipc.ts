import { ipcMain } from "electron";
import { db } from "../../db";

ipcMain.handle("system:get-preferences", async (event) => {
  let preferences = await db.preferences.findUnique({
    where: {
      id: 0,
    },
  });
  console.log("Preferences:");
  console.log({ preferences });
  if (!preferences) {
    console.log("no preference found");
    preferences = {
      accentColor: "#caf2ff",
      id: 0,
      genres: "",
    };
    await db.preferences.create({ data: preferences });
  }
  return preferences;
});

ipcMain.handle("system:set-preferences", async (event, update) => {
  await db.preferences.update({
    data: update,
    where: {
      id: 0,
    },
  });
});

ipcMain.handle("cache:http-delete", async (event) => {
  await db.response.deleteMany({});
  return "ok";
});
