import { assert } from "../call.ts";
import type { Socket } from "../deps.ts";
import { Status } from "../exec/process.ts";

import type { God } from "../god.ts";

// deno-lint-ignore no-empty-interface
export interface KillCall {}

export async function kill(_: KillCall, sock: Socket, god: God): Promise<void> {
  for (const process of god.processes.values()) {
    assert(
      "KILL",
      process.status !== Status.Online,
      "all spawned processes must be offline or errored",
    );
  }
  await sock.send(JSON.stringify({}));
  god.kill = true;
}
