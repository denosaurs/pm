import { join } from "./god/deps.ts";

export async function spawn() {
  const out = await Deno.open(
    join("logs", "log.out"),
    { create: true, append: true },
  );
  const err = await Deno.open(
    join("logs", "log.out"),
    { create: true, append: true },
  );

  const script = Deno.build.os === "windows" ? "./starter.bat" : "./starter.sh";

  const process = Deno.run({
    cmd: [script],
    stdin: "null",
    stderr: err.rid,
    stdout: out.rid,
    cwd: Deno.cwd(),
    env: {
      "NO_COLOR": "_",
    },
  });

  await process.status();
}
