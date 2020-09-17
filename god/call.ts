import type { Socket } from "./deps.ts";
import type { God } from "./god.ts";

import type { KillCall } from "./calls/kill.ts";
import type { PingCall, PingPayload } from "./calls/ping.ts";
import type { StatCall, StatPayload } from "./calls/stat.ts";
import type { ListCall, ListPayload } from "./calls/list.ts";
import type { StopCall, StopPayload } from "./calls/stop.ts";
import type { StartCall, StartPayload } from "./calls/start.ts";

type CallArgs<T> = [T, Socket, God];

export type Calls = {
  KILL: CallArgs<KillCall>;
  PING: CallArgs<PingCall>;
  STAT: CallArgs<StatCall>;
  LIST: CallArgs<ListCall>;
  STOP: CallArgs<StopCall>;
  START: CallArgs<StartCall>;
};

export interface Ok<T> {
  ok: true;
  data: T;
}

export interface Error {
  ok: false;
  data: string;
}

export type Status<T> = Ok<T> | Error;

export type Payloads = {
  KILL: undefined;
  PING: Status<PingPayload>;
  STAT: Status<StatPayload>;
  LIST: Status<ListPayload>;
  STOP: Status<StopPayload>;
  START: Status<StartPayload>;
};

export function assert(expr: unknown, msg = ""): asserts expr {
  if (!expr) {
    throw {
      ok: false,
      data: msg ?? "Unexpected error occurred",
    };
  }
}

export function ok<T>(payload: T): Ok<T> {
  return {
    ok: true,
    data: payload,
  };
}
