import type { Status } from "../god/call.ts";
import type { PingPayload } from "../god/calls/ping.ts";

import { call } from "./_ws.ts";

export async function ping(sock: WebSocket): Promise<Status<PingPayload>> {
  return await call("PING", {}, sock);
}

if (import.meta.main) {
  const payload = await call("PING", {});
  console.table(payload);
}
