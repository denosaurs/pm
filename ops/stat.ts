import { call } from "./_ws.ts";

if (import.meta.main) {
  let xid: number | undefined;
  if (Deno.args[0]) {
    xid = parseInt(Deno.args[0]);
  }
  const payload = await call("STAT", {
    xid,
  });
  console.table(payload);
}
