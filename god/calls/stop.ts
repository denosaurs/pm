import type { Socket } from "../deps.ts";

import type { Ok } from "../call.ts";
import { assert, ok } from "../call.ts";

import type { God } from "../god.ts";

import type { Process } from "../exec/process.ts";
import { Status } from "../exec/process.ts";

export interface StopCall {
  xid: number;
}

export type StopPayload = Process;

export async function stop(
  { xid }: StopCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const process = god.processes.get(xid);
  assert(process);
  assert(process.status === Status.Online);
  process.raw.close();
  process.status = Status.Offline;
  const payload: Ok<StopPayload> = ok(process);
  sock.send(JSON.stringify(payload));
}
