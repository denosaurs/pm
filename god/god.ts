import { serve, Server } from "https://deno.land/std@0.69.0/http/server.ts";
import {
  acceptWebSocket,
  WebSocket,
} from "https://deno.land/std@0.69.0/ws/mod.ts";

import type { Call } from "../ops/_ops.ts";

async function handleWs(server: Server, sock: WebSocket) {
  try {
    for await (const event of sock) {
      console.log(event);
      if (typeof event === "string") {
        const request = JSON.parse(event) as Call;
        switch (request.type) {
          case "PING":
            const payload = { god: Deno.pid };
            sock.send(JSON.stringify(payload));
            break;
          case "KILL":
            await sock.close(1000);
            server.close();
            break;
        }
      }
    }
  } catch (err) {
    if (!sock.isClosed) {
      await sock.close(1001).catch(console.error);
    }
    throw err;
  }
}

if (import.meta.main) {
  const port = "8080";
  console.log(`websocket server is running on :${port}`);
  const server = serve(`:${port}`);
  for await (const req of server) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then((sock) => handleWs(server, sock))
      .catch(async (err) => {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      });
  }
  Deno.stderr.close();
  Deno.stdout.close();
}
