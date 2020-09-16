import { call } from "./_ws.ts";

if (import.meta.main) {
  const ping = await call("PING", {
    type: "PING",
  });
  if (ping.ok) {
    const payload = await call("STAT", {
      pid: 123,
    });
    console.log(payload);
  }
}
