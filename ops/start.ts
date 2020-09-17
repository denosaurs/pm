import type { StartCall } from "../god/calls/start.ts";
import { call } from "./_ws.ts";

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
  console.table(payload);
}
