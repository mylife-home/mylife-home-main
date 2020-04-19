
export interface Type extends Function { new (...args: any[]): any; }

const types = new Set<Type>();

export function registerType(type: Type) {
  types.add(type);
}

export function getTypes() {
  return types;
}
