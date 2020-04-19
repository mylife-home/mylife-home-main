import 'reflect-metadata';

export type Constructor = {
  new (...args: any[]): any,
  name: string
};

const types = new Set<Constructor>();

function registerType(type: Constructor) {
  types.add(type);
}

export function getTypes() {
  return types;
}

export interface ComponentOptions {
  readonly name?: string;
}

export function component(target: Constructor): void;
export function component(options: ComponentOptions): (target: Constructor) => void;
export function component(optionsOrTarget: ComponentOptions | Constructor) {
  if(optionsOrTarget instanceof Function) {
    const target = optionsOrTarget;
    const options: ComponentOptions = {};
    Reflect.defineMetadata('mylife-home:component', options, target);
    registerType(target);
    return;
  }

  const options = optionsOrTarget;
  return (target: Constructor) => {
    Reflect.defineMetadata('mylife-home:component', options, target);
    registerType(target);
  };
}

export interface ActionOptions {
  readonly type?: string;
}

export function action(target: any, propertyKey: string): void;
export function action(options: ActionOptions): (target: any, propertyKey: string) => void;
export function action(optionsOrTarget: any, propertyKey?: string) {
  if(propertyKey) {
    const target = optionsOrTarget;
    const options: ActionOptions = {};
    Reflect.defineMetadata('mylife-home:component', options, target, propertyKey);
    return;
  }

  const options = optionsOrTarget as ActionOptions;
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('mylife-home:component', options, target), propertyKey;
  };
}

export interface StateOptions {
  readonly type?: string;
}

export function state(target: any, propertyKey: string): void;
export function state(options: StateOptions): (target: any, propertyKey: string) => void;
export function state(optionsOrTarget: any, propertyKey?: string) {
  if(optionsOrTarget instanceof Function) {
    const target = optionsOrTarget;
    const options: StateOptions = {};
    Reflect.defineMetadata('mylife-home:component', options, target, propertyKey);
    return;
  }

  const options = optionsOrTarget as StateOptions;
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('mylife-home:component', options, target), propertyKey;
  };
}
