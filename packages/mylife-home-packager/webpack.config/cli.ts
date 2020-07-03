import { Configuration } from 'webpack';
import { Environment, Context, createContext } from './context';

import core from './core';
import ui from './ui';

type ConfigurationFile = (context: Context) => Configuration | Configuration[];

const binaries: { [name: string]: ConfigurationFile; } = { core, ui };

export default (env: Environment) => {
  const context = createContext(env);
  const configurations: Configuration[] = [];

  for (const binary of selectBinaries(context)) {
    const ibinary = binary(context);
    if (Array.isArray(ibinary)) {
      for (const bin of ibinary) {
        configurations.push(bin);
      }
    } else {
      configurations.push(ibinary);
    }
  }

  return configurations;
};

function selectBinaries(context: Context) {
  const name = context.env.binary;
  if (!name) {
    return Object.values(binaries);
  }

  const binary = binaries[name];
  if (!binary) {
    throw new Error(`Binary '${name}' does not exist`);
  }

  return [binary];
}