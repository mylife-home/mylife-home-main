import { Configuration } from 'webpack';
import { createContext } from './context';
import { getConfigurationFactories } from './binaries';

export default (env: { [name: string]: any }) => {
  const { mode, ...options } = env;
  const context = createContext(mode, options);

  const configurations: Configuration[] = [];
  for (const configurationFactory of getConfigurationFactories()) {
    configurations.push(configurationFactory(context));
  }

  return configurations;
};
