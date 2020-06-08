import path from 'path';
import fs from 'fs';
import { components, buildInfo, logger } from 'mylife-home-common';
import { metadata } from '../components';

const log = logger.createLogger('mylife:home:core:manager:plugin-loader');

declare function __non_webpack_require__(path: string): any;
declare const __webpack_modules__: any;
declare function __webpack_require__(id: any): any;

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
    webPackRequireChunk(filePath);
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }
}

function webPackRequireChunk(chunkPath: string) {
  // for now when we call configure the chunk entry point with "dependOn":
  // require on the output chunk returns { id: any ids: [any], modules: [list of files, with the first === entry point]}
  // let's add it to the modules repository, and call require the first one
  const chunk = __non_webpack_require__(chunkPath);

  Object.assign(__webpack_modules__, chunk.modules);

  // require everything
  // TODO: identify module entry
  for(const moduleId of Object.keys(chunk.modules)) {
    __webpack_require__(moduleId);
  }
}