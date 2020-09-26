import type { Socket } from "../deps.ts";
import type { Ok } from "../call.ts";
import { ok } from "../call.ts";

// deno-lint-ignore no-empty-interface
export interface PingCall {}

export interface PingPayload {
  pid: number; // god pid
}

export async function ping(_: PingCall, sock: Socket): Promise<void> {
  await sock.send(
    JSON.stringify(
      ok("PING", {
        pid: Deno.pid,
      }),
    ),
  );
}
