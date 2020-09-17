import { call } from "./_ws.ts";

export async function kill(sock: WebSocket): Promise<void> {
  await call("KILL", {}, sock);
}

if (import.meta.main) {
  await call("KILL", {});
}
