export interface Process {
  xid: number;
  pid: number;
  out: number;
  err: number;
  cmd: string[];
  cwd: string;
  env?: {
    [key: string]: string;
  };
}
