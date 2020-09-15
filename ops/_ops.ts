import type { PingCall, PingPayload } from "./ping.ts";
import type { KillCall } from "./kill.ts";
import type { StatCall, StatPayload } from "./stat.ts";

export interface Call {
  type: keyof Calls;
}

export interface Calls {
  PING: [PingCall, PingPayload];
  KILL: [KillCall, undefined];
  STAT: [StatCall, StatPayload];
}
