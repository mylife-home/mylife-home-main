import path from 'path';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import base from './base';
import modes from './modes';
import { Environment, ConfigurationFactory, Paths } from './types';

import core from './core';
import ui from './ui';

type ConfigurationItem = ConfigurationFactory | Configuration;
type ConfigurationFile = (paths: Paths) => ConfigurationItem | ConfigurationItem[];

const binaries: { [name: string]: ConfigurationFile; } = { core, ui };

export default (env: Environment) => {
  const paths = createPaths(env);
  const configurations: Configuration[] = [];

  for (const binary of selectBinaries(env)) {
    const ibinary = binary(paths);
    if (Array.isArray(ibinary)) {
      for (const bin of ibinary) {
        configurations.push(createConfiguration(env, paths, bin));
      }
    } else {
      configurations.push(createConfiguration(env, paths, ibinary));
    }
  }

  return configurations;
};

function createPaths(env: Environment) : Paths{
  return {
    base: path.resolve(__dirname, '..'),
    output: path.resolve(__dirname, '..', 'dist', env.mode)
  };
}

function createConfiguration(env: Environment, paths: Paths, binary: ConfigurationFactory | Configuration) {
  const mode = modes(paths)[env.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: ${env.mode}`);
  }

  const ibase = base(paths);

  return typeof binary === 'function' ? binary(env) : merge(ibase, mode, binary);
};

function selectBinaries(env: Environment) {
  const name = env.binary;
  if (!name) {
    return Object.values(binaries);
  }

  const binary = binaries[name];
  if (!binary) {
    throw new Error(`Binary '${name}' does not exist`);
  }

  return [binary];
}