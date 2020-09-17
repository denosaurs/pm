import {
  serve,
  acceptSocket,
  isSocketCLoseEvent,
  Server,
  Socket,
  EventEmitter,
} from "./deps.ts";

import type { Calls } from "./call.ts";

import type { Process } from "./exec/process.ts";
import { isProcess } from "./exec/process.ts";

import { kill } from "./calls/kill.ts";
import { ping } from "./calls/ping.ts";
import { stat } from "./calls/stat.ts";
import { list } from "./calls/list.ts";
import { stop } from "./calls/stop.ts";
import { start } from "./calls/start.ts";
import { remove } from "./calls/remove.ts";

export interface Event {
  type: keyof Calls;
  // deno-lint-ignore no-explicit-any
  call: any;
}

export interface GodOptions {
  port?: number;
}

export class God extends EventEmitter<Calls> {
  gxid: number;
  processes: Map<number, Process>;

  port: number;
  server: Server;

  constructor(options?: GodOptions) {
    super();
    const { port }: Required<GodOptions> = Object.assign({}, options, {
      port: 8080,
    });
    this.gxid = 0;
    this.processes = new Map();
    this.port = port;
    this.server = serve(`:${port}`);
  }

  async handle(sock: Socket) {
    try {
      for await (const event of sock) {
        if (typeof event === "string") {
          const request = JSON.parse(event) as Event;
          console.log("REQ", request);
          switch (request.type) {
            case "KILL":
            case "PING":
            case "STAT":
            case "LIST":
            case "STOP":
            case "START":
            case "REMOVE": {
              this.emit(request.type, request.call, sock, this);
              break;
            }
            default:
              await sock.close(1001).catch(console.error);
          }
        } else if (isSocketCLoseEvent(event)) {
          console.log("CLOSE", event);
        }
      }
    } catch (err) {
      if (!sock.isClosed) {
        await sock.close(1001).catch(console.error);
      }
      console.log("RES", err);
    }
  }

  async run() {
    console.log(`websocket server is running on :${this.port}`);
    for await (const req of this.server) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      acceptSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
        .then((sock) => this.handle(sock))
        .catch(async () => {
          await req.respond({ status: 400 });
        });
    }
  }
}

type Listener<T> = (a: T, sock: Socket, god: God) => void | Promise<void>;

function wrap<T>(fn: Listener<T>): Listener<T> {
  return async (a: T, sock: Socket, god: God) => {
    try {
      await fn(a, sock, god);
    } catch (_) {
      sock.send(JSON.stringify(_));
    }
  };
}

if (import.meta.main) {
  const god = new God({ port: 8080 });
  god.on("KILL", wrap(kill));
  god.on("PING", wrap(ping));
  god.on("STAT", wrap(stat));
  god.on("LIST", wrap(list));
  god.on("STOP", wrap(stop));
  god.on("START", wrap(start));
  god.on("REMOVE", wrap(remove));
  await god.run();
  console.log("EEE");
  Deno.stderr.close();
  Deno.stdout.close();
  // TODO: god hangs when killed with running other processes, investigate
}
