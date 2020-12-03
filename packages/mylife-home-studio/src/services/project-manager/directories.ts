import path from 'path';
import { tools } from 'mylife-home-common';
import { Config } from './config';

interface Directories {
  core: string;
  ui: string;
}

const directories: Directories = {
  core: null,
  ui: null,
};

export function configure() {
  const config = tools.getConfigItem<Config>('projectManager');
  
  directories.core = path.resolve(config.corePath);
  directories.ui = path.resolve(config.uiPath);
}

export const core = () => directories.core;
export const ui = () => directories.ui;
