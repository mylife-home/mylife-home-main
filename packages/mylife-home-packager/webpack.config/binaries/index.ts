import { ConfigurationFactory } from './common/types';
import * as core from './core';
import * as ui from './ui';
import * as studio from './studio';

export { ConfigurationFactory };

const configurationFactories = new Map<string, ConfigurationFactory>();
configurationFactories.set(makeKey('ui', 'bin'), ui.bin);
configurationFactories.set(makeKey('ui', 'client'), ui.client);
configurationFactories.set(makeKey('core', 'lib'), core.lib);
configurationFactories.set(makeKey('core', 'bin'), core.bin);
configurationFactories.set(makeKey('studio', 'bin'), studio.bin);
configurationFactories.set(makeKey('studio', 'client'), studio.client);

for (const pluginName of core.listPlugins()) {
  configurationFactories.set(makeKey('core', 'plugins-' + pluginName), (context) => core.plugin(context, pluginName));
}

function makeKey(binary: string, part: string) {
  return `${binary}|${part}`;
}

export function getConfigurationFactories() {
  return configurationFactories.values();
}

export function getConfigurationFactory(binary: string, part: string) {
  const factory = configurationFactories.get(makeKey(binary, part));
  if (factory) {
    return factory;
  }

  throw new Error(`Configuration factory not found for binary '${binary}' and part '${part}'`);
}
