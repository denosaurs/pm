import type { Socket } from "../deps.ts";

import type { Call } from "../call.ts";
import type { God } from "../god.ts";

export interface KillCall extends Call {}

export async function kill(_: KillCall, sock: Socket, god: God): Promise<void> {
  await sock.close(1000);
  god.server.close();
}
