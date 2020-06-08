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
    if(fileName.endsWith('.js')) {
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
    webPackLoadDll(filePath);
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }
}

function webPackLoadDll(dllPath: string) {
  // retrieve entry module id from manifest
  const manifest = JSON.parse(fs.readFileSync(dllPath + '.manifest', 'utf-8'));
  const entries = Object.keys(manifest.content);
  if(entries.length !== 1) {
    throw new Error(`Cannot load module '${dllPath}': entries.length = ${entries.length}`);
  }
  const moduleId = manifest.content[entries[0]].id;

  // reproduce DllReference loading
  const dllId = `dll ${dllPath}`;
  __webpack_modules__[dllId] = (module: any) => module.exports = __non_webpack_require__(dllPath);
  __webpack_require__(dllId)(moduleId);
}