import {
  Application,
  Router,
  isSocketAcceptable,
  isSocketCLoseEvent,
  Socket,
  EventEmitter,
} from "./deps.ts";

import type { Calls } from "./call.ts";

import type { Process } from "./exec/process.ts";

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

  app: Application;
  port: number;
  controller: AbortController;

  kill: boolean = false;

  constructor(options?: GodOptions) {
    super();
    const { port }: Required<GodOptions> = Object.assign({}, options, {
      port: 8080,
    });
    this.gxid = 0;
    this.processes = new Map();
    this.app = new Application();
    this.port = port;
    this.controller = new AbortController();
  }

  async handle(sock: Socket) {
    for await (const event of sock) {
      if (typeof event === "string") {
        const request = JSON.parse(event) as Event;
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
        if (this.kill) {
          this.controller.abort();
        }
      }
    }
  }

  async run() {
    const router = new Router();
    router.get("/ws", async (ctx) => {
      if (isSocketAcceptable(ctx.request)) {
        const sock = await ctx.upgrade();
        this.handle(sock);
      } else {
        ctx.response.body = "Endpoint reserved for websocket connections";
        ctx.response.status = 400;
      }
    });
    router.get("/", (ctx) => {
      ctx.response.body = "Up and Running";
    });
    this.app.use(router.routes());
    this.app.use(router.allowedMethods());
    const { signal } = this.controller;
    signal.addEventListener("abort", () => {
      console.log("BYE");
      Deno.stderr.close()
      Deno.stdout.close()
    })
    await this.app.listen({ port: this.port, signal });
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
}
