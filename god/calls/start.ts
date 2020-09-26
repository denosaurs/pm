import { join, hasOwnProperty, Socket } from "../deps.ts";

import { ok, assert } from "../call.ts";

import type { God } from "../god.ts";

import type { Process } from "../exec/process.ts";
import { Status } from "../exec/process.ts";

import { nameify } from "../exec/name.ts";

export type StartCall = StartNewCall | StartExistingCall;
export type StartArgs = StartNewCall & StartExistingCall;

export type Env = {
  [key: string]: string;
};

export interface StartNewCall {
  cmd: string[];
  cwd: string;
  env?: Env;
}

export interface StartExistingCall {
  xid: number;
}

export type StartPayload = Process;

export function isOldCall(a: StartCall): a is StartExistingCall {
  return hasOwnProperty(a, "xid");
}

export async function start(
  call: StartCall,
  sock: Socket,
  god: God,
): Promise<void> {
  if (isOldCall(call)) return startExisting(call, sock, god);
  else return startNew(call, sock, god);
}

export async function startExisting(
  { xid }: StartExistingCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const old = god.processes.get(xid);
  assert("START", old, "process not found");
  assert("START", old.status !== Status.Online, "process must not be running");

  const process = await startProcess(old, god);

  sock.send(JSON.stringify(ok("START", process)));
}

export async function startNew(
  { cmd, cwd, env }: StartNewCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const xid = ++god.gxid;

  const process = await startProcess({ cmd, cwd, env, xid }, god);

  sock.send(JSON.stringify(ok("START", process)));
}

export type LogFiles = { out: number; err: number };
export async function createLogFiles(xid: number): Promise<LogFiles> {
  const { rid: out } = await Deno.open(join("logs", `${xid}.out`), {
    create: true,
    append: true,
  });
  const { rid: err } = await Deno.open(join("logs", `${xid}.err`), {
    create: true,
    append: true,
  });
  return { out, err };
}

export async function startProcess(
  { xid, cmd, cwd, env }: StartArgs,
  god: God,
): Promise<Process> {
  const { err, out } = await createLogFiles(xid);

  const raw = Deno.run({
    cmd,
    cwd,
    env,
    stdout: out,
    stderr: err,
    stdin: "null",
  });
  const { pid } = raw;

  const controller = new AbortController();

  let process: Process;
  let maybe = god.processes.get(xid);
  if (maybe) {
    process = maybe;
    process.raw = raw;
    process.pid = pid;
    process.out = out;
    process.err = err;
    process.restarts++;
    process.status = Status.Online;
    process.controller = controller;
  } else {
    process = {
      raw,
      xid,
      pid,
      cmd,
      cwd,
      env,
      out,
      err,
      name: nameify(cmd),
      status: Status.Online,
      restarts: 0,
      controller,
    };
  }

  process.controller.signal.addEventListener("abort", () => {
    process.status = Status.Offline;
    Deno.close(process.out);
    Deno.close(process.err);
    process.raw.close();
  });

  process.raw
    .status()
    .then((status) => {
      if (process.status === Status.Online) {
        process.status = status.success ? Status.Offline : Status.Errored;
        Deno.close(process.out);
        Deno.close(process.err);
        process.raw.close();
        startProcess(process, god);
      }
    })
    .catch(() => {});

  god.processes.set(xid, process);

  return process;
}
