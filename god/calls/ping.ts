import type { Socket } from "../deps.ts";
import type { Call, Ok } from "../call.ts";
import { ok } from "../call.ts";

export interface PingCall extends Call {}

export interface PingPayload {
  god: number; // god pid
}

export async function ping(_: PingCall, sock: Socket): Promise<void> {
  const payload: Ok<PingPayload> = ok({
    god: Deno.pid,
  });
  await sock.send(JSON.stringify(payload));
}
