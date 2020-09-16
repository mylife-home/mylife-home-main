// https://github.com/trentm/node-bunyan#levels
export interface Level {
  readonly id: string;
  readonly value: number;
  readonly description: string;
}

export const levels: Level[] = [
  { id: 'fatal', value: 60, description: 'The service/app is going to stop or become unusable now. An operator should definitely look into this soon.' },
  { id: 'error', value: 50, description: 'Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).' },
  { id: 'warn', value: 40, description: 'A note on something that should probably be looked at by an operator eventually.' },
  { id: 'info', value: 30, description: 'Detail on regular operation.' },
  { id: 'debug', value: 20, description: 'Anything else, i.e. too verbose to be included in "info" level.' },
  { id: 'trace', value: 10, description: 'Logging from external libraries used by your app or very detailed application logging.' },
];

export const levelsById = indexBy(levels, level => level.id);
export const levelsByValue = indexBy(levels, level => level.value);

function indexBy<Item, Key>(array: Item[], selector: (item: Item) => Key) {
  const map = new Map<Key, Item>();
  for (const item of array) {
    const key = selector(item);
    map.set(key, item);
  }

  return map;
}