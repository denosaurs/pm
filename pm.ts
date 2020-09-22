import { table } from "../gutenberg/table/table.ts";

import { parse, tabtab, ParsedEnv } from "./deps.ts";

import { kill } from "./ops/kill.ts";
import { ping } from "./ops/ping.ts";
import { list } from "./ops/list.ts";
import { stop } from "./ops/stop.ts";
import { remove } from "./ops/remove.ts";
import { start } from "./ops/start.ts";

import { spawn } from "./spawn.ts";

import type { DecoratedProcess } from "./god/calls/list.ts";

interface PrettyProcess {
  name: string;
  pid: number;
  "↺": number;
  status: string;
  cpu: number;
  mem: number;
}

function prettyProcesses(
  processes: DecoratedProcess[],
): Record<string, PrettyProcess> {
  const data: Record<string, PrettyProcess> = {};
  for (const process of processes) {
    data[process.xid] = {
      name: process.name,
      pid: process.pid,
      "↺": 0,
      status: process.status,
      cpu: process.stats?.cpu ?? 0,
      mem: process.stats?.mem ?? 0,
    };
  }
  return data;
}

async function isOnline(): Promise<boolean> {
  return await fetch("http://localhost:8080")
    .then(() => true)
    .catch(() => false);
}

function complete(env: ParsedEnv) {
  if (env.words === 1) { // top level commands
    return tabtab.log([
      {
        name: "kill",
        description: "Kill the denon god process",
      },
      {
        name: "ping",
        description: "Ping the denon god process",
      },
      {
        name: "start",
        description: "Start a new process",
      },
      {
        name: "ls",
        description: "Show all spawned processes",
      },
      {
        name: "stop",
        description: "Stop a spawned processes",
      },
      {
        name: "remove",
        description: "Remove a spawned processes",
      },
      "completions",
      "remove-completions",
    ]);
  }
}

async function run() {
  const args = [...Deno.args];
  const [cmd] = args.splice(0, 1);

  if (cmd === "completions") {
    return await tabtab.install({
      name: "denon",
      completer: "denon",
      cmd: "__completion",
    });
  }

  if (cmd === "remove-completions") {
    return await tabtab.uninstall({ name: "denon" });
  }

  if (cmd === "__completion") {
    return complete(tabtab.parseEnv());
  }

  let online = await isOnline();
  if (cmd === "kill" && !online) {
    console.log("god process alread dead");
    return;
  }

  if (!online) {
    console.log("starting god process");
    await spawn();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const sock = new WebSocket("ws://localhost:8080/ws");
  sock.onclose = () => Deno.exit(0);
  await new Promise((resolve) => sock.onopen = resolve);

  if (cmd === "kill") {
    console.log("killing god process...");
    const payload = await kill(sock);
    if (!payload.ok) console.error(payload.data);
  }
  if (cmd === "ping") {
    console.log(await ping(sock));
  }
  if (cmd === "ls") {
    const payload = await list(sock);
    if (payload.ok) {
      const pretty = prettyProcesses(payload.data.processes);
      console.log(table(pretty, {
        key: "xid",
      }));
    } else {
      console.error(payload.data);
    }
  }
  if (cmd === "start") {
    let startCall;
    if (args.length === 1) {
      startCall = { xid: parseInt(args[0]) };
    } else {
      startCall = {
        cmd: args,
        cwd: Deno.cwd(),
      };
    }
    const payload = await start(sock, startCall);
    if (payload.ok) {
      const pretty = prettyProcesses([payload.data]);
      console.log(table(pretty, {
        key: "xid",
      }));
    } else {
      console.error(payload.data);
    }
  }
  if (cmd === "stop") {
    const xid = parseInt(args[0]);
    const payload = await stop(sock, xid);
    if (payload.ok) {
      const pretty = prettyProcesses([payload.data]);
      console.log(table(pretty, {
        key: "xid",
      }));
    } else {
      console.error(payload.data);
    }
  }
  if (cmd === "remove") {
    const xid = parseInt(args[0]);
    await remove(sock, xid);
  }
  sock.close(1000);
}

if (import.meta.main) {
  run();
}
