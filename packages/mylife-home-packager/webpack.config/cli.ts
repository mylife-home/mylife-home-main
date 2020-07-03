import { Configuration } from 'webpack';
import { Environment, createContext } from './context';
import { ConfigurationFile } from './types';

import core from './core';
import ui from './ui';

const configurationFactories: ConfigurationFile = {};
Object.assign(configurationFactories, core);
Object.assign(configurationFactories, ui);

export default (env: Environment) => {
  const context = createContext(env);
  const configurations: Configuration[] = [];

  for (const configurationFactory of Object.values(configurationFactories)) {
    const configuration = configurationFactory(context);
    configurations.push(configuration);
  }

  return configurations;
};
