import { decode } from "../deps.ts";

import type { Socket } from "../deps.ts";

import { assert, ok } from "../call.ts";
import type { God } from "../god.ts";

export interface StatCall {
  xid?: number;
}

export interface StatPayload {
  pid: number;
  ppid: number;
  uid: number;
  cpu: number;
  mem: number;
  etime: number;
  comm: string;
}

/** Parse `ps` time format returning seconds */
export function posixTime(time: string): number {
  const times = time.replace("-", ":").split(":");
  const values = Array(4 - times.length).fill(0);
  times.forEach((n) => values.push(parseInt(n)));
  return (
    values[0] * 86400 + // days
    values[1] * 3600 + // hours
    values[2] * 60 + // minutes
    values[3]
  ); // seconds
}

async function getPosix(pid: number): Promise<StatPayload> {
  const cmd = [
    "ps",
    "-p",
    pid.toString(),
    "-o",
    "pid,ppid,uid,etime,%cpu,%mem,comm",
  ];
  const process = Deno.run({
    cmd,
    stdout: "piped",
  });
  await process.status();
  process.close();
  const output = await process.output();
  const raw = decode(output).replace(/  +/g, " ");
  const statsline = raw.split("\n")[1].trim();

  const stats = statsline.split(" ");
  assert("STAT", stats.length === 7, "couldn't fetch stats");

  const _pid = stats[0];
  assert("STAT", pid.toString() === _pid, "pid does not match");

  const ppid = parseInt(stats[1]);
  const uid = parseInt(stats[2]);

  const etime = posixTime(stats[3]);
  const cpu = parseFloat(stats[4]);
  const mem = parseFloat(stats[5]);
  const comm = stats[6];
  return {
    pid,
    ppid,
    uid,
    cpu,
    mem,
    etime,
    comm,
  };
}

export async function stat(
  { xid }: StatCall,
  sock: Socket,
  god: God,
): Promise<void> {
  let pid = Deno.pid;
  if (xid) {
    const process = god.processes.get(xid);
    assert("STAT", process, "process not found");
    pid = process.pid;
  }
  const stats = await getStats(pid);
  await sock.send(JSON.stringify(ok("STAT", stats)));
}

export async function getStats(pid: number): Promise<StatPayload> {
  switch (Deno.build.os) {
    case "darwin":
    case "linux":
      return await getPosix(pid);
    case "windows":
      return await getPosix(pid); // TODO: statsWindows
  }
}
