import { Configuration } from 'webpack';
import { createContext, getConfigurationFactories, getConfigurationFactory } from '.';

export default (env: { [name: string]: any }) => {
  const { mode, ...options } = env;
  const context = createContext(mode, options);

  if (env.binary && env.part) {
    const configurationFactory = getConfigurationFactory(env.binary, env.part);
    return configurationFactory(context);
  }

  const configurations: Configuration[] = [];
  for (const configurationFactory of getConfigurationFactories()) {
    configurations.push(configurationFactory(context));
  }

  return configurations;
};
