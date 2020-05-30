import path from 'path';
import fs from 'fs';
import { components, buildInfo, logger } from 'mylife-home-common';
import { metadata } from '../components';

const log = logger.createLogger('mylife:home:core:manager:plugin-loader');

declare function __non_webpack_require__(path: string): any;

export function loadPlugins(registry: components.Registry) {
  const pluginDirectory = path.join(__dirname, 'plugins');
  for(const fileName of fs.readdirSync(pluginDirectory)) {
    if(fileName.endsWith('.js') && !fileName.endsWith('.map.js')) {
      const filePath = path.join(pluginDirectory, fileName);
      loadPlugin(registry, filePath);
    }
  }
}

function loadPlugin(registry: components.Registry, filePath: string) {
  const bi = buildInfo.getInfo();
  const moduleName = path.parse(filePath).name;
  const pluginVersion = bi.modules[`mylife-home-core-plugins-${moduleName}`].version;

  log.info(`loading module ${moduleName} v${pluginVersion}`);

  metadata.builder.init(moduleName, pluginVersion, registry);
  try {
    __non_webpack_require__(filePath);
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }
}
