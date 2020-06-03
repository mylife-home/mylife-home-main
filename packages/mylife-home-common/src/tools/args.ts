import yargs from 'yargs';

let cachedArgs: { [name: string]: any; };

export function getArgs() {
  if (!cachedArgs) {
    cachedArgs = yargs.argv;
  }
  return cachedArgs;
}

export function getArg<T>(name: string, defaultValue: T) {
  const value = getArgs()[name];
  return value === undefined ? defaultValue : value;
}
