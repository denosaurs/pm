import { call } from "./_ws.ts";

export async function stat(sock: WebSocket, xid?: number) {
  return await call("STAT", { xid }, sock);
}

if (import.meta.main) {
  let xid: number | undefined;
  if (Deno.args[0]) {
    xid = parseInt(Deno.args[0]);
  }
  const payload = await call("STAT", {
    xid,
  });
  console.log(payload.data);
}
