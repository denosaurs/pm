import { parse, tabtab, ParsedEnv } from "./deps.ts";

import { kill } from "./ops/kill.ts";
import { ping } from "./ops/ping.ts";

import { spawn } from "./spawn.ts";

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

  const sock = new WebSocket("ws://localhost:8080");
  await new Promise((resolve) => sock.onopen = resolve);

  if (cmd === "kill") {
    console.log("killing god process...");
    await kill(sock);
  }
  if (cmd === "ping") {
    console.log(await ping(sock));
  }

  sock.onclose = () => Deno.exit(0);
  sock.close(1000);
}

if (import.meta.main) {
  run();
}
