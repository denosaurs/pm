import { basename } from "../deps.ts";

export function getDenoName(cmd: string[]): string {
  const args = [...cmd].splice(2); // jump over `deno` and `{cmd}`
  const file = args.find((_) => !_.startsWith("-"));
  if (!file) return cmd[0];
  try {
    // it's a URL
    const url = new URL(file);
    return basename(url.pathname);
  } catch {
    // it's a path
    const path = file;
    return basename(path);
  }
}

export function nameify(cmd: string[]): string {
  if (cmd.length === 1) return cmd[0];
  const exe = cmd[0].toLowerCase();
  switch (exe) {
    case "deno":
      return getDenoName(cmd);
    default:
      return exe;
  }
}
