import type { Calls, Payloads } from "../god/call.ts";

export function call<T extends keyof Calls>(
  type: T,
  call: Calls[T][0],
): Promise<Payloads[T][0]> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("starting op");
      ws.send(JSON.stringify({
        type,
        call,
      }));
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Payloads[T][0];
      resolve(payload);
      ws.close(1000, "bye");
    };

    ws.onclose = () => {
      console.log("op is closing");
    };

    ws.onerror = reject;
  });
}
