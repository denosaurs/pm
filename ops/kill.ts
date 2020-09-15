import type { Call } from "./_ops.ts";
import { call } from "./_ws.ts";

export interface KillCall extends Call {
  type: "KILL";
}

if (import.meta.main) {
  call("KILL", {
    type: "KILL",
  });
}
