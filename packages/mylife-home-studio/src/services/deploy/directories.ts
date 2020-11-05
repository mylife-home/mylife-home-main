import path from 'path';
import { tools } from 'mylife-home-common';
import { Config } from './config';

interface Directories {
  files: string;
  recipes: string;
  pins: string;
}

const directories: Directories = {
  files: null,
  recipes: null,
  pins: null,
};

export function configure() {
  const config = tools.getConfigItem<Config>('deploy');
  
  directories.files = path.resolve(config.filesPath);
  directories.recipes = path.resolve(config.recipesPath);
  directories.recipes = path.resolve(config.recipesPath);
  directories.pins = path.resolve(config.pinnedRecipesFile);
}

export const files = () => directories.files;
export const recipes = () => directories.recipes;
export const pins = () => directories.pins;
