import type { Socket } from "../deps.ts";

import type { God } from "../god.ts";

// deno-lint-ignore no-empty-interface
export interface KillCall {}

export async function kill(
  _: KillCall,
  sock: Socket,
  god: God,
): Promise<void> {
  await sock.close(1000);
  god.server.close();
}
