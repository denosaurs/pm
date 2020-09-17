import type { Status } from "../god/call.ts";
import type { ListPayload } from "../god/calls/list.ts";

import { call } from "./_ws.ts";

export async function list(sock: WebSocket): Promise<Status<ListPayload>> {
  return await call("LIST", {}, sock);
}

interface PrettyProcess {
  name: string;
  pid: number;
  "↺": number;
  status: string;
  cpu: number;
  mem: number;
}

if (import.meta.main) {
  const payload = await call("LIST", {});
  if (payload.ok) {
    const data: Record<string, PrettyProcess> = {};
    for (const process of payload.data.processes) {
      data[process.xid] = {
        name: process.name,
        pid: process.pid,
        "↺": 0,
        status: process.status,
        cpu: process.stats?.cpu ?? 0,
        mem: process.stats?.mem ?? 0,
      };
    }
    console.log(data);
  }
}
