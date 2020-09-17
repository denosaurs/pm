import { call } from "./_ws.ts";

if (import.meta.main) {
  const xid = parseInt(Deno.args[0]);
  const payload = await call("STOP", {
    xid,
  });
  console.table(payload);
}
