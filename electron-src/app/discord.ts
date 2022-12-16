const client = require("discord-rich-presence")("1053147880296296458");

export function updateRPC(sub1: string, sub2: string) {
  client.updatePresence({
    state: sub1,
    details: sub2,
    instance: true,
    largeImageKey: "centered",
  });
}
