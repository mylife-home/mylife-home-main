export interface LogRecord {
  name: string;
  instanceName: string;
  hostname: string;
  pid: number;
  level: number;
  msg: string;
  time: string;
  v: number;
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}
