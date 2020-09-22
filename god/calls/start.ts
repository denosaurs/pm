import { join, hasOwnProperty, Socket } from "../deps.ts";

import type { Ok } from "../call.ts";
import { ok, assert } from "../call.ts";

import type { God } from "../god.ts";

import type { Process } from "../exec/process.ts";
import { Status } from "../exec/process.ts";

import { nameify } from "../exec/name.ts";

export type StartCall = StartNewCall | StartOldCall;

export interface StartNewCall {
  cmd: string[];
  cwd: string;
  env?: {
    [key: string]: string;
  };
}

export interface StartOldCall {
  xid: number;
}

export type StartPayload = Process;

export function isOldCall(a: StartCall): a is StartOldCall {
  return hasOwnProperty(a, "xid");
}

export async function start(
  call: StartCall,
  sock: Socket,
  god: God,
): Promise<void> {
  if (isOldCall(call)) return startOld(call, sock, god);
  else return startNew(call, sock, god);
}

export async function startOld(
  { xid }: StartOldCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const old = god.processes.get(xid);
  assert("START", old, "process not found");
  assert(
    "START",
    old.status !== Status.Online,
    "process must not be running",
  );

  const process = await startProcess(old);

  god.processes.set(xid, process);

  sock.send(JSON.stringify(ok("START", process)));
}

export async function startNew(
  { cmd, cwd, env }: StartNewCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const xid = ++god.gxid;
  const process = await startProcess({ cmd, cwd, env, xid });

  god.processes.set(xid, process);

  sock.send(JSON.stringify(ok("START", process)));
}

export async function startProcess(
  { cmd, cwd, env, xid }: StartNewCall & StartOldCall,
): Promise<Process> {
  const out = await Deno.open(
    join("logs", `${xid}.out`),
    { create: true, append: true },
  );
  const err = await Deno.open(
    join("logs", `${xid}.err`),
    { create: true, append: true },
  );
  const raw = Deno.run({
    cmd,
    cwd,
    env,
    stderr: err.rid,
    stdout: out.rid,
    stdin: "null",
  });
  const controller = new AbortController();
  const process: Process = {
    raw,
    xid,
    pid: raw.pid,
    cmd,
    cwd,
    env,
    out: out.rid,
    err: err.rid,
    name: nameify(cmd),
    status: Status.Online,
    controller,
  };

  process.controller.signal.addEventListener("abort", () => {
    process.status = Status.Offline;
    process.raw.close();
    Deno.close(process.out);
    Deno.close(process.err);
  });

  process.raw.status()
    .then((status) => {
      process.status = status.success ? Status.Offline : Status.Errored;
      process.raw.close();
      Deno.close(process.out);
      Deno.close(process.err);
    })
    .catch((err) => console.error(err));

  return process;
}
