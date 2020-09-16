import { call } from "./_ws.ts";

if (import.meta.main) {
  const payload = await call("RUN", {
    cmd: Deno.args,
    cwd: Deno.cwd(),
  });
  console.log(payload);
}
