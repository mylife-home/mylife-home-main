import 'reflect-metadata';
import { addComponent, addAction, addState } from './descriptors';
import { Type } from './types';

export type Constructor = {
  new (...args: any[]): any;
  name: string;
};

export interface ComponentOptions {
  readonly name?: string;
}

export function component(target: Constructor): void;
export function component(options: ComponentOptions): (target: Constructor) => void;
export function component(optionsOrTarget: ComponentOptions | Constructor) {
  if (optionsOrTarget instanceof Function) {
    const target = optionsOrTarget;
    const options: ComponentOptions = {};
    addComponent(target, options);
    return;
  }

  const options = optionsOrTarget;
  return (target: Constructor) => {
    addComponent(target, options);
  };
}

export interface ActionOptions {
  readonly type?: Type;
}

export function action(target: any, propertyKey: string): void;
export function action(options: ActionOptions): (target: any, propertyKey: string) => void;
export function action(optionsOrTarget: any, propertyKey?: string) {
  if (propertyKey) {
    const target = optionsOrTarget;
    const options: ActionOptions = {};
    addAction(target.constructor, propertyKey, options);
    return;
  }

  const options = optionsOrTarget as ActionOptions;
  return (target: any, propertyKey: string) => {
    addAction(target.constructor, propertyKey, options);
  };
}

export interface StateOptions {
  readonly type?: Type;
}

export function state(target: any, propertyKey: string): void;
export function state(options: StateOptions): (target: any, propertyKey: string) => void;
export function state(optionsOrTarget: any, propertyKey?: string) {
  if (propertyKey) {
    const target = optionsOrTarget;
    const options: StateOptions = {};
    addState(target.constructor, propertyKey, options);
    return;
  }

  const options = optionsOrTarget as StateOptions;
  return (target: any, propertyKey: string) => {
    addState(target.constructor, propertyKey, options);
  };
}
