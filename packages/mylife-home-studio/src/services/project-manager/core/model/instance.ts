import { logger } from 'mylife-home-common';
import { CoreToolboxDisplay } from '../../../../../shared/project-manager';
import { ComponentModel } from './component';
import { PluginModel } from './plugin';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class InstanceModel {
  private readonly usage = new Map<string, ComponentModel>();
  private readonly plugins = new Map<string, PluginModel>();

  constructor(public readonly instanceName: string) { }

  registerPlugin(plugin: PluginModel) {
    this.plugins.set(plugin.id, plugin);
  }

  unregisterPlugin(id: string) {
    this.plugins.delete(id);
  }

  registerUsage(component: ComponentModel) {
    this.usage.set(component.id, component);
  }

  unregisterUsage(id: string) {
    this.usage.delete(id);
  }

  get used() {
    return this.usage.size > 0;
  }

  get hasPlugins() {
    return this.plugins.size > 0;
  }

  hasComponent(id: string) {
    return this.usage.has(id);
  }

  updateAllPluginsDisplay(wantedDisplay: CoreToolboxDisplay) {
    const pluginIds = [];

    for (const plugin of this.plugins.values()) {
      if (plugin.updateDisplay(wantedDisplay)) {
        pluginIds.push(plugin.id);
      }
    }

    return pluginIds;
  }

  getAllUnusedPluginIds() {
    const pluginIds = [];

    for (const plugin of this.plugins.values()) {
      if (!plugin.used) {
        pluginIds.push(plugin.id);
      }
    }

    return pluginIds;
  }
}
