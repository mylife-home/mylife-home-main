import 'reflect-metadata';
import { components } from 'mylife-home-common';
import { addPlugin, addConfig, addAction, addState } from './builder';

import metadata = components.metadata;

export type Constructor = {
  new (...args: any[]): any;
  name: string;
};

export interface PluginOptions {
  readonly name?: string;
  readonly description?: string;
  readonly usage: metadata.PluginUsage;
}

export function plugin(options: PluginOptions) {
  return (target: Constructor) => {
    addPlugin(target, options);
  };
}

export interface ConfigOptions {
  readonly name: string;
  readonly description?: string;
  readonly type: metadata.ConfigType;
}

export function config(options: ConfigOptions) {
  return (target: Constructor) => {
    addConfig(target, options);
  };
}

export interface ActionOptions {
  readonly description?: string;
  readonly type?: metadata.Type;
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
  readonly description?: string;
  readonly type?: metadata.Type;
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
