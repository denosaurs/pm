import type { Call } from "./_ops.ts";
import { call } from "./_ws.ts";

export interface StatCall extends Call {
  type: "STAT";
  pid: number;
}

export interface StatPayload {
  pid: number;
  elapsed: number;
  cpu: number;
  mem: number;
  args: string[];
}

if (import.meta.main) {
  const ping = await call("PING", {
    type: "PING",
  });
  const payload = await call("STAT", {
    type: "STAT",
    pid: ping.god,
  });
  console.log(payload);
}
