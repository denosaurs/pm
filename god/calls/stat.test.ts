import { assertEquals } from "../../test_deps.ts";

import { posixTime } from "./stat.ts";

const fixturesPosixTime: [string, number][] = [
  ["21-18:26:30", 1880790],
  ["06-00:15:30", 519330],
  ["15:28:37", 55717],
  ["48:14", 2894],
  ["00:01", 1],
];

for (const [value, result] of fixturesPosixTime) {
  Deno.test({
    name: `god | calls | stats | posixTime | ${value}`,
    fn(): void {
      assertEquals(posixTime(value), result);
    },
  });
}
