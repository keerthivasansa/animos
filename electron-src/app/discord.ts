const client = require("discord-rich-presence")("1053147880296296458");

// NEITHER OF THESE CAN BE NULL OR EMPTY OR IT WILL NOT WORK
export function updateRPC(sub1: string, sub2: string) {
  client.updatePresence({
    details: sub1,
    state: sub2,
    instance: true,
    largeImageKey: "centered",
    startTimestamp: Date.now(),
  });
}
