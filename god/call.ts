import type { Socket } from "./deps.ts";
import type { God } from "./god.ts";

import type { PingCall, PingPayload } from "./calls/ping.ts";
import type { StatCall, StatPayload } from "./calls/stat.ts";
import type { KillCall } from "./calls/kill.ts";
import type { RunCall, RunPayload } from "./calls/run.ts";

export interface Call {}

export type Calls = {
  PING: [PingCall, Socket, God];
  KILL: [KillCall, Socket, God];
  STAT: [StatCall, Socket, God];
  RUN: [RunCall, Socket, God];
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
  PING: [Status<PingPayload>];
  KILL: [undefined];
  STAT: [Status<StatPayload>];
  RUN: [Status<RunPayload>];
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
