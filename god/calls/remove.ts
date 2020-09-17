import type { Socket } from "../deps.ts";

import { assert, ok } from "../call.ts";

import type { God } from "../god.ts";

import type { Process } from "../exec/process.ts";
import { Status } from "../exec/process.ts";

export interface RemoveCall {
  xid: number;
}

export type RemovePayload = Process;

export async function remove(
  { xid }: RemoveCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const process = god.processes.get(xid);
  assert("REMOVE", process, "process not found");
  assert(
    "REMOVE",
    process.status !== Status.Online,
    "process must not be running",
  );
  god.processes.delete(xid);
  sock.send(JSON.stringify(ok("REMOVE", process)));
}
