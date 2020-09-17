import { hasOwnProperty } from "../deps.ts";

export interface Process {
  raw: Deno.Process;
  xid: number;
  pid: number;
  out: number;
  err: number;
  cmd: string[];
  cwd: string;
  env?: {
    [key: string]: string;
  };
  name: string;
  status: Status;
}

export enum Status {
  Online = "ONLINE",
  Offline = "OFFLINE",
  Errored = "ERRORED",
}

export function isProcess(a: unknown): a is Process {
  return hasOwnProperty(a, "pid");
}
