export namespace LogRecord {
  export const VERSION = 1;
}

export interface LogRecord {
  time: Date;
  v: number;
  instanceName: string;
  name: string;
  level: number;
  msg: string;
  err?: {
    message: string;
    name: string;
    stack: string;
  };
}
