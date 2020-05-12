import bunyan from 'bunyan';

export function createLogger(name: string) {
  return bunyan.createLogger({ name });
}