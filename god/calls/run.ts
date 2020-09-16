import { join, Socket } from "../deps.ts";

import type { Call, Ok } from "../call.ts";
import { ok } from "../call.ts";

import type { God } from "../god.ts";
import type { Process } from "../registry/process.ts";

export interface RunCall extends Call {
  cmd: string[];
  cwd: string;
  env?: {
    [key: string]: string;
  };
}

export type RunPayload = Process;

export async function run(
  { cmd, cwd, env }: RunCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const xid = ++god.gxid;
  const out = await Deno.open(
    join("logs", `${xid}.out`),
    { create: true, append: true },
  );
  const err = await Deno.open(
    join("logs", `${xid}.err`),
    { create: true, append: true },
  );
  const proc = Deno.run({
    cmd,
    cwd,
    env,
    stderr: err.rid,
    stdout: out.rid,
  });
  proc.status().then(() => {
    out.close();
    err.close();
  });
  const process: Process = {
    xid,
    pid: proc.pid,
    cmd,
    cwd,
    env,
    out: out.rid,
    err: err.rid,
  };

  god.processes.set(xid, process);

  const payload: Ok<RunPayload> = ok(process);
  await sock.send(JSON.stringify(payload));
}
