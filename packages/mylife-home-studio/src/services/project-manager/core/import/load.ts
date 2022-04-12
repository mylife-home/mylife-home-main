import { logger, components } from 'mylife-home-common';
import { pick, clone } from '../../../../utils/object-utils';
import { ImportFromOnlineConfig, ImportFromProjectConfig } from '../../../../../shared/project-manager';
import { ResolvedProjectView } from '../model';
import { Services } from '../../..';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:import');

export interface ImportData {
  plugins: PluginImport[];
  components: ComponentImport[];
}

export interface ComponentImport {
  id: string;
  pluginId: string;
  external: boolean;
  config: { [name: string]: any; };
}

export interface PluginImport {
  id: string;
  instanceName: string;
  plugin: components.metadata.NetPlugin;
}

export function loadOnlineData(config: ImportFromOnlineConfig): ImportData {
  const plugins = new Map<string, PluginImport>();
  const components: ComponentImport[] = [];
  const onlineService = Services.instance.online;

  if (config.importPlugins) {
    const instanceNames = onlineService.getInstanceNames();
    for (const instanceName of instanceNames) {
      const onlinePlugins = onlineService.getPlugins(instanceName);
      for (const onlinePlugin of onlinePlugins) {
        ensureOnlinePlugin(plugins, instanceName, onlinePlugin);
      }
    }
  }

  if (config.importComponents) {
    for (const { instanceName, component: onlineComponent } of onlineService.getComponentsData()) {
      const { id: pluginId } = ensureOnlinePlugin(plugins, instanceName, onlineComponent.plugin);

      components.push({
        id: onlineComponent.id,
        pluginId,
        external: true,
        config: null
      });
    }
  }

  return { plugins: Array.from(plugins.values()), components };
}

function ensureOnlinePlugin(plugins: Map<string, PluginImport>, instanceName: string, onlinePlugin: components.metadata.Plugin): PluginImport {
  const id = `${instanceName}:${onlinePlugin.id}`;

  const existing = plugins.get(id);
  if (existing) {
    return existing;
  }

  const pluginImport: PluginImport = {
    id,
    instanceName,
    plugin: components.metadata.encodePlugin(onlinePlugin)
  };

  plugins.set(id, pluginImport);
  return pluginImport;
}

export function loadProjectData(view: ResolvedProjectView, config: ImportFromProjectConfig): ImportData {
  const plugins = new Map<string, PluginImport>();
  const components: ComponentImport[] = [];

  if (config.importPlugins) {
    for (const id of view.getPluginsIds()) {
      ensureProjectPlugin(plugins, view, id);
    }
  }

  if (config.importComponents) {
    const external = config.importComponents === 'external';

    for (const id of view.getComponentsIds()) {
      const componentView = view.getComponent(id);
      if (componentView.external) {
        continue;
      }

      ensureProjectPlugin(plugins, view, componentView.plugin.id);

      components.push({
        id: componentView.id,
        pluginId: componentView.plugin.id,
        external,
        config: external ? null : clone(componentView.config)
      });
    }
  }

  return { plugins: Array.from(plugins.values()), components };
}

function ensureProjectPlugin(plugins: Map<string, PluginImport>, view: ResolvedProjectView, id: string): PluginImport {
  const existing = plugins.get(id);
  if (existing) {
    return existing;
  }

  const pluginView = view.getPlugin(id);

  const pluginImport: PluginImport = {
    id: pluginView.id,
    instanceName: pluginView.instance.instanceName,
    plugin: {
      ...pick(pluginView.data, 'name', 'module', 'usage', 'version', 'description'),
      members: clone(pluginView.data.members),
      config: clone(pluginView.data.config),
    }
  };

  plugins.set(id, pluginImport);
  return pluginImport;
}
