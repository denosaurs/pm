import type { Socket } from "../deps.ts";

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
  assert("STOP", process, "process not found");
  assert("STOP", process.status === Status.Online, "process must be running");

  process.controller.abort();

  sock.send(JSON.stringify(ok("STOP", process)));
}
