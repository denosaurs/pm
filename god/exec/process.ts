import { hasOwnProperty } from "../deps.ts";

export interface Process {
  raw: Deno.Process;
  pid: number;
  xid: number;
  out: number;
  err: number;
  cmd: string[];
  cwd: string;
  env?: {
    [key: string]: string;
  };
  name: string;
  status: Status;
  restarts: number;
  controller: AbortController;
}

export enum Status {
  Online = "ONLINE",
  Offline = "OFFLINE",
  Errored = "ERRORED",
}

export function isProcess(a: unknown): a is Process {
  return hasOwnProperty(a, "pid");
}
