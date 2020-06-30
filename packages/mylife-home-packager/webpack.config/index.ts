import path from 'path';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import base from './base';
import modes from './modes';
import { Environment, Arguments, ConfigurationFactory, Paths } from './types';

import core from './core';
import ui from './ui';

type ConfigurationItem = ConfigurationFactory | Configuration;
type ConfigurationFile = (paths: Paths) => ConfigurationItem | ConfigurationItem[];

const binaries: ConfigurationFile[] = [core, ui];

export default (env: Environment, argv: Arguments) => {
  const paths = {
    base: path.resolve(__dirname, '..'),
    output: path.resolve(__dirname, '..', 'dist', env.mode)
  };

  const configurations: Configuration[] = [];

  const createConfiguration = (binary: ConfigurationFactory | Configuration) => {
    const mode = modes(paths)[env.mode];
    if (!mode) {
      throw new Error(`Unsupported mode: ${env.mode}`);
    }

    const ibase = base(paths);

    const config = typeof binary === 'function' ? binary(env, argv) : merge(ibase, mode, binary);
    configurations.push(config);
  };

  for (const binary of binaries) {
    const ibinary = binary(paths);
    if (Array.isArray(ibinary)) {
      ibinary.forEach(createConfiguration);
    } else {
      createConfiguration(ibinary);
    }
  }

  return configurations;
};
