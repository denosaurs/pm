import {
  serve,
  acceptSocket,
  isSocketCLoseEvent,
  Server,
  Socket,
  EventEmitter,
} from "./deps.ts";

import type { Call, Calls } from "./call.ts";
import type { Process } from "./registry/process.ts";

import { ping } from "./calls/ping.ts";
import { stat } from "./calls/stat.ts";
import { kill } from "./calls/kill.ts";
import { run } from "./calls/run.ts";

export interface Event<T extends Call = Call> {
  type: string;
  call: T;
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
            case "PING":
            case "STAT":
            case "KILL":
            case "RUN": {
              // deno-lint-ignore no-explicit-any
              this.emit(request.type, request.call as any, sock, this);
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
        .catch(async (err) => {
          console.error(`failed to accept websocket: ${err}`);
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
  god.on("PING", wrap(ping));
  god.on("STAT", wrap(stat));
  god.on("KILL", wrap(kill));
  god.on("RUN", wrap(run));
  await god.run();
  Deno.stderr.close();
  Deno.stdout.close();
}
