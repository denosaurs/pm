import { call } from "./_ws.ts";

if (import.meta.main) {
  const ping = await call("PING", {
    type: "PING",
  });
  if (ping.ok) {
    const payload = await call("STAT", {
      pid: ping.data.god,
    });
    console.log(payload);
  }
}
