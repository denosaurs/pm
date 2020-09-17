import type { DecoratedProcess } from "../god/calls/list.ts";

import { call } from "./_ws.ts";

interface PrettyProcess {
  pid: number;
  "↺": number;
  status: string;
  cpu: number;
  mem: number;
}

if (import.meta.main) {
  const payload = await call("LIST", {});
  if (payload.ok) {
    const table: Record<string, PrettyProcess> = {};
    for (const process of payload.data.processes) {
      table[process.xid] = {
        pid: process.pid,
        "↺": 0,
        status: process.status,
        cpu: process.stats?.cpu ?? 0,
        mem: process.stats?.mem ?? 0,
      };
    }
    console.table(table);
  }
}
