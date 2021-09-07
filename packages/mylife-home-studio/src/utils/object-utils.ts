export function clone<T>(source: T): T {
  return JSON.parse(JSON.stringify(source));
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/underscore/index.d.ts

type _Pick<V, K extends string> = Extract<K, keyof V> extends never ? Partial<V> : Pick<V, Extract<K, keyof V>>;

export function pick<V, K extends string>(object: V, ...keys: K[]): _Pick<V, K> {
  const ret: any = {};

  for (const key of keys) {
    ret[key] = (object as any)[key];
  }

  return ret;
}
