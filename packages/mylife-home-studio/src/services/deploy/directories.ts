import path from 'path';
import { tools } from 'mylife-home-common';

let config: Config;

interface Config {
  filesPath: string;
  recipesPath: string;
}

export function configure() {
  config = tools.getConfigItem<Config>('deploy');
}

export const files = () => config.filesPath;
export const recipes = () => config.recipesPath;
