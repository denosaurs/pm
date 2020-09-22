import type { Status } from "../god/call.ts";
import type { StartCall, StartPayload } from "../god/calls/start.ts";

import { call } from "./_ws.ts";

export async function start(
  sock: WebSocket,
  opts: StartCall,
): Promise<Status<StartPayload>> {
  return await call("START", opts, sock);
}

if (import.meta.main) {
  let start: StartCall;
  if (Deno.args.length === 1) {
    const xid = parseInt(Deno.args[0]);
    start = {
      xid,
    };
  } else {
    start = {
      cmd: Deno.args,
      cwd: Deno.cwd(),
    };
  }
  const payload = await call("START", start);
  console.log(payload.data);
}
