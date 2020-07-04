import { Configuration } from 'webpack';
import { Environment, createContext } from './context';
import { getConfigurationFactories } from './binaries';

export default (env: Environment) => {
  const context = createContext(env);

  const configurations: Configuration[] = [];
  for(const configurationFactory of getConfigurationFactories()) {
    configurations.push(configurationFactory(context));
  }
  
  return configurations;
};
