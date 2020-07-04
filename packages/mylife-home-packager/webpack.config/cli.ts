import { Configuration } from 'webpack';
import { Environment, createContext } from './context';

import * as core from './binaries/core';
import * as ui from './binaries/ui';

export default (env: Environment) => {
  const context = createContext(env);
  const configurations: Configuration[] = [];

  configurations.push(ui.client(context));
  configurations.push(ui.server(context));
  configurations.push(core.lib(context));
  configurations.push(core.core(context));

  for(const pluginName of core.listPlugins()) {
    configurations.push(core.plugin(context, pluginName));
  }
  
  return configurations;
};
