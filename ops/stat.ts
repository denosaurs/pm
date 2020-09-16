import { call } from "./_ws.ts";

if (import.meta.main) {
  let pid: number | undefined;
  if (Deno.args[0]) {
    pid = parseInt(Deno.args[0]);
  }
  const payload = await call("STAT", {
    pid,
  });
  console.log(payload);
}
