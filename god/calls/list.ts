import type { Socket } from "../deps.ts";
import type { Process } from "../exec/process.ts";

import type { Ok } from "../call.ts";
import { ok } from "../call.ts";

import type { God } from "../god.ts";
import { getStats, StatPayload } from "./stat.ts";

// deno-lint-ignore no-empty-interface
export interface ListCall {}

export interface DecoratedProcess extends Process {
  stats?: StatPayload;
}

export interface ListPayload {
  processes: DecoratedProcess[];
}

export async function list(
  _: ListCall,
  sock: Socket,
  god: God,
): Promise<void> {
  const promises: Promise<DecoratedProcess>[] = [];
  for (const process of god.processes.values()) {
    const { pid } = process;
    promises.push((async (): Promise<DecoratedProcess> => {
      try {
        const stats = await getStats(pid);
        return {
          ...process,
          stats,
        };
      } catch {
        return {
          ...process,
        };
      }
    })());
  }
  const processes = await Promise.all(promises);
  sock.send(JSON.stringify(ok("LIST", {
    processes,
  })));
}
