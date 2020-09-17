import { call } from "./_ws.ts";

if (import.meta.main) {
  const payload = await call("PING", {});
  console.table(payload);
}
