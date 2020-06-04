const defines: { [name: string]: any } = {};

export function getDefine<T>(name: string) {
  const item = defines[name];
  if (item === undefined) {
    throw new Error(`Missing define: '${name}'`);
  }
  return item as T;
}

export function setDefine<T>(name: string, value: T) {
  defines[name] = value;
}
