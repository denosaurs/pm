import type { Status } from "../god/call.ts";

import { call } from "./_ws.ts";

export async function kill(sock: WebSocket): Promise<Status<undefined>> {
  return await call("KILL", {}, sock);
}

if (import.meta.main) {
  await call("KILL", {});
}
