import bunyan from 'bunyan';

const instanceName = 'my-instance-TODO';

export function createLogger(name: string) {
  return bunyan.createLogger({ instanceName, name });
}