import { Client } from "discord-rpc";

const client = new Client({
  transport: "ipc",
});

client.login({
  clientId: "1054012091356430386",
});

client.on("connected", () => console.log("Discord RPC connected"));

export function updateRPC(title: string, subtitle: string) {
  client.setActivity({
    largeImageText: "Animos",
    buttons: [
      {
        label: "Download",
        url: "https://github.com/Nectres/animos",
      },
    ],
    details: title.padEnd(2),
    state: subtitle.padEnd(2),
    largeImageKey: "logo",
    startTimestamp: Date.now(),
  });
}
