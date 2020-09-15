const out = await Deno.open("log.out", { create: true, append: true });
const err = await Deno.open("log.err", { create: true, append: true });

const script = Deno.build.os === "windows" ? "./starter.bat" : "./starter.sh";

const process = Deno.run({
  cmd: [script],
  stdin: "null",
  stderr: err.rid,
  stdout: out.rid,
  cwd: Deno.cwd(),
});

console.log("Started PID", process.pid);
await process.status();
