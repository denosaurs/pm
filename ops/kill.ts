import { call } from "./_ws.ts";

if (import.meta.main) {
  call("KILL", {});
}
