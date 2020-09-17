import type { Socket } from "./deps.ts";
import type { God } from "./god.ts";

import type { KillCall } from "./calls/kill.ts";
import type { PingCall, PingPayload } from "./calls/ping.ts";
import type { StatCall, StatPayload } from "./calls/stat.ts";
import type { ListCall, ListPayload } from "./calls/list.ts";
import type { StopCall, StopPayload } from "./calls/stop.ts";
import type { StartCall, StartPayload } from "./calls/start.ts";
import type { RemoveCall, RemovePayload } from "./calls/remove.ts";

type CallArgs<T> = [T, Socket, God];

export type Calls = {
  KILL: CallArgs<KillCall>;
  PING: CallArgs<PingCall>;
  STAT: CallArgs<StatCall>;
  LIST: CallArgs<ListCall>;
  STOP: CallArgs<StopCall>;
  START: CallArgs<StartCall>;
  REMOVE: CallArgs<RemoveCall>;
};

export interface Ok<T> {
  type: string;
  ok: true;
  data: T;
}

export interface Error {
  type: string;
  ok: false;
  data: string;
}

export type Status<T> = Ok<T> | Error;

export type Payloads = {
  KILL: undefined;
  PING: PingPayload;
  STAT: StatPayload;
  LIST: ListPayload;
  STOP: StopPayload;
  START: StartPayload;
  REMOVE: RemovePayload;
};

export function assert(
  type: keyof Payloads,
  expr: unknown,
  msg?: string,
): asserts expr {
  if (!expr) {
    throw {
      type,
      ok: false,
      data: msg ?? "Unexpected error occurred",
    };
  }
}

export function ok<T extends keyof Payloads>(
  type: T,
  payload: Payloads[T],
): Ok<Payloads[T]> {
  return {
    type,
    ok: true,
    data: payload,
  };
}
