import type { Calls, Payloads, Status } from "../god/call.ts";

export function call<T extends keyof Calls>(
  type: T,
  call: Calls[T][0],
  sock?: WebSocket,
): Promise<Status<Payloads[T]>> {
  return new Promise((resolve, reject) => {
    const ws = sock ?? new WebSocket("ws://localhost:8080/ws");

    const data = JSON.stringify({
      type,
      call,
    });

    if (!sock) {
      ws.onopen = () => {
        ws.send(data);
      };
    } else {
      ws.send(data);
    }

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Status<Payloads[T]>;
      resolve(payload);
      if (!sock) ws.close(1000);
    };

    ws.onerror = reject;
  });
}
