import path from 'path';
import { components, buildInfo } from 'mylife-home-common';
import { metadata } from '../components';

export function loadPlugins(registry: components.Registry) {
  // TODO: list files
}

function loadPlugin(registry: components.Registry, filePath: string) {
  // TODO: logs
  const bi = buildInfo.getInfo();
  const moduleName = path.parse(filePath).name;
  const moduleBuildInfo = bi.modules[`mylife-home-core-plugins-${moduleName}`];

  metadata.builder.init(moduleName, moduleBuildInfo.version, registry);
  try {
    require(filePath);
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }
}
