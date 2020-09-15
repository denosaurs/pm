import type { Call } from "./_ops.ts";
import { call } from "./_ws.ts";

export interface PingCall extends Call {
  type: "PING";
}

export interface PingPayload {
  god: number; // god pid
}

if (import.meta.main) {
  const payload = await call("PING", {
    type: "PING",
  });
  console.log(payload);
}
