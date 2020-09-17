import type { Status } from "../god/call.ts";
import type { StopPayload } from "../god/calls/stop.ts";

import { call } from "./_ws.ts";

export async function stop(
  sock: WebSocket,
  xid: number,
): Promise<Status<StopPayload>> {
  return await call("STOP", { xid }, sock);
}

if (import.meta.main) {
  const xid = parseInt(Deno.args[0]);
  const payload = await call("STOP", {
    xid,
  });
  console.log(payload.data);
}
