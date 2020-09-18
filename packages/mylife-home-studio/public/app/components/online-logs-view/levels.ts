import { makeStyles } from '@material-ui/core/styles';

// https://github.com/trentm/node-bunyan#levels
export interface Level {
  readonly id: string;
  readonly value: number;
  readonly description: string;
}

export const levels: readonly Level[] = [
  { id: 'fatal', value: 60, description: 'The service/app is going to stop or become unusable now. An operator should definitely look into this soon.' },
  { id: 'error', value: 50, description: 'Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).' },
  { id: 'warn', value: 40, description: 'A note on something that should probably be looked at by an operator eventually.' },
  { id: 'info', value: 30, description: 'Detail on regular operation.' },
  { id: 'debug', value: 20, description: 'Anything else, i.e. too verbose to be included in "info" level.' },
  { id: 'trace', value: 10, description: 'Logging from external libraries used by your app or very detailed application logging.' },
];

const levelsById = indexBy(levels, level => level.id);
const levelsByValue = indexBy(levels, level => level.value);

export const getLevelById = (id: string) => mapGet(levelsById, id);
export const findLevelByValue = (value: number) => levelsByValue.get(value);

function indexBy<Item, Key>(array: readonly Item[], selector: (item: Item) => Key) {
  const map = new Map<Key, Item>();
  for (const item of array) {
    const key = selector(item);
    map.set(key, item);
  }

  return map;
}

function mapGet<Key, Value>(map: Map<Key, Value>, key: Key) {
  const value = map.get(key);
  if(value === undefined) {
    throw new Error(`Item with key '${key}' not found`);
  }
  return value;
}

export const useLevelStyles = makeStyles((theme) => ({
  default: {
  },
  fatal: {
    // inverse
    color: theme.palette.background.default,
    background: theme.palette.text.primary,
  },
  error: {
    // red
    color: '#cd3131',
  },
  warn: {
    // magenta
    color: '#bc05bc',
  },
  info: {
    // cyan
    color: '#0598bc',
  },
  debug: {
    // yellow
    color: '#949800',
  },
  trace: {
    // white
    color: '#555555',
  },
}));
