import path from 'path';
import fs from 'fs';
import { components, buildInfo, logger, instanceInfo } from 'mylife-home-common';
import { metadata } from '../components';

const log = logger.createLogger('mylife:home:core:manager:plugin-loader');

declare function __non_webpack_require__(path: string): any;
declare const __webpack_modules__: any;
declare function __webpack_require__(id: any): any;

let loadingPlugin = false;
let loadingPluginVersion: string = null;

/**
 * Used by plugins at load time
 * @param version 
 */
export function registerPluginVersion(version: string) {
  if(!loadingPlugin) {
    throw new Error('registerPluginVersion: can only call this API while loading a plugin');
  }

  if(loadingPluginVersion) {
    throw new Error('registerPluginVersion: cannot call this API twice');
  }

  loadingPluginVersion = version;
}

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
  const moduleName = path.parse(filePath).name;
  let pluginVersion: string;

  log.info(`loading module ${moduleName} v${pluginVersion}`);

  metadata.builder.init(moduleName, registry);
  loadingPlugin = true;
  try {
    webPackLoadDll(filePath);

    if(!loadingPluginVersion) {
      throw new Error('registerPluginVersion: must be called while loading a plugin');
    }

    pluginVersion = loadingPluginVersion;

    metadata.builder.build(pluginVersion);
  } finally {
    metadata.builder.terminate();
    loadingPlugin = false;
    loadingPluginVersion = null;
  }

  instanceInfo.addComponent(`core-plugins-${moduleName}`, pluginVersion);

  log.info(`loaded module ${moduleName} v${pluginVersion}`);

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