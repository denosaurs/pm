import type { Status } from "../god/call.ts";
import type { RemovePayload } from "../god/calls/remove.ts";

import { call } from "./_ws.ts";

export async function remove(
  sock: WebSocket,
  xid: number,
): Promise<Status<RemovePayload>> {
  return await call("REMOVE", { xid }, sock);
}

if (import.meta.main) {
  const xid = parseInt(Deno.args[0]);
  const payload = await call("REMOVE", {
    xid,
  });
  console.log(payload.data);
}
