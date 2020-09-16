import type { Socket } from "../deps.ts";

import type { Call } from "../call.ts";
import type { God } from "../god.ts";

export interface KillCall extends Call {
  pid?: number;
}

export async function kill(
  { pid }: KillCall,
  sock: Socket,
  god: God,
): Promise<void> {
  if (!pid) {
    await sock.close(1000);
    god.server.close();
  }
}
