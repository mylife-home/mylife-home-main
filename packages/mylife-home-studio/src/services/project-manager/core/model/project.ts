import { logger } from 'mylife-home-common';
import { ConfigItem, Plugin } from '../../../../../shared/component-model';
import { CoreComponentData, CorePluginData, CoreProject, CoreTemplate } from '../../../../../shared/project-manager';
import { InstanceModel, PluginModel, TemplateModel, ViewModel } from '.';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class ProjectModel extends ViewModel {
  private readonly instances = new Map<string, InstanceModel>();
  private readonly plugins = new Map<string, PluginModel>();
  private readonly templates = new Map<string, TemplateModel>();

  protected get project() {
    return this;
  }

  constructor(public readonly data: CoreProject) {
    super();

    for (const [id, pluginData] of Object.entries(data.plugins)) {
      this.registerPlugin(id, pluginData);
    }

    for (const [id, templateData] of Object.entries(data.templates)) {
      this.registerTemplate(id, templateData);
    }

    super.init();

    // Need to do this once all templates has been added, else one template which depends on another may have issues loading
    for (const template of this.templates.values()) {
      template.init();
    }
  }

  private getOrCreateInstance(instanceName: string) {
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }

    const newInstance = new InstanceModel(instanceName);
    this.instances.set(instanceName, newInstance);
    return newInstance;
  }

  private registerPlugin(id: string, pluginData: CorePluginData) {
    const instance = this.getOrCreateInstance(pluginData.instanceName);
    const plugin = new PluginModel(instance, id, pluginData);

    this.plugins.set(plugin.id, plugin);
    instance.registerPlugin(plugin);

    return plugin;
  }

  deletePlugin(id: string) {
    const plugin = this.getPlugin(id);
    this.plugins.delete(id);

    delete this.data.plugins[id];

    const { instance } = plugin;
    instance.unregisterPlugin(id);
    if (!instance.hasPlugins) {
      this.instances.delete(instance.instanceName);
    }
  }

  hasInstance(instanceName: string) {
    return this.instances.has(instanceName);
  }

  getInstance(instanceName: string) {
    const instance = this.instances.get(instanceName);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' does not exist`);
    }

    return instance;
  }

  getInstancesNames() {
    return Array.from(this.instances.keys());
  }

  getPluginsIds() {
    return Array.from(this.plugins.keys());
  }

  hasPlugin(id: string) {
    return this.plugins.has(id);
  }

  findPlugin(id: string) {
    return this.plugins.get(id);
  }

  getPlugin(id: string) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Instance '${id}' does not exist`);
    }

    return plugin;
  }

  getTemplatesIds() {
    return Array.from(this.templates.keys());
  }

  hasTemplate(id: string) {
    return this.templates.has(id);
  }

  findTemplate(id: string) {
    return this.templates.get(id);
  }

  getTemplate(id: string) {
    const component = this.templates.get(id);
    if (!component) {
      throw new Error(`Template '${id}' does not exist`);
    }

    return component;
  }

  getTemplateOrSelf(templateId: string): ViewModel {
    return templateId ? this.getTemplate(templateId) : this;
  }

  private registerTemplate(id: string, templateData: CoreTemplate) {
    const template = new TemplateModel(this, id, templateData);

    this.templates.set(template.id, template);

    return template;
  }

  setTemplate(templateId: string) {
    if (this.hasTemplate(templateId)) {
      throw new Error(`Template id already exists: '${templateId}'`);
    }

    const templateData: CoreTemplate = {
      components: {},
      bindings: {},
      exports: {
        config: {},
        members: {}
      }
    };

    const template = this.registerTemplate(templateId, templateData);
    this.data.templates[template.id] = template.data;
    template.init();

    return template;
  }

  renameTemplate(id: string, newId: string) {
    if (this.hasTemplate(newId)) {
      throw new Error(`Template id already exists: '${newId}'`);
    }

    const template = this.templates.get(id);
    this.templates.delete(id);
    delete this.data.templates[id];

    template.rename(newId);

    this.templates.set(template.id, template);
    this.data.templates[template.id] = template.data;
  }

  clearTemplate(id: string) {
    const template = this.templates.get(id);
    if (template.hasComponents()) {
      throw new Error(`Cannot delete template '${id}' because it is used.`);
    }

    for (const componentId of template.getComponentsIds()) {
      template.clearComponent(componentId);
    }

    for (const bindingId of template.getBindingsIds()) {
      template.clearBinding(bindingId);
    }

    this.templates.delete(template.id);
    delete this.data.templates[template.id];
  }

  // Note: impacts checks are already done
  importPlugin(instanceName: string, netPlugin: Plugin) {
    const pluginData: CorePluginData = {
      ...netPlugin,
      instanceName,
      toolboxDisplay: 'show'
    };

    const id = `${instanceName}:${netPlugin.module}.${netPlugin.name}`;
    const existing = this.findPlugin(id);
    if (existing) {
      // update its data
      existing.executeImport(pluginData);
      return existing;
    }

    const plugin = this.registerPlugin(id, pluginData);
    this.data.plugins[id] = plugin.data;

    return plugin;
  }

  // Note: impacts checks are already done
  importComponent(id: string, pluginId: string, external: boolean, config: { [id: string]: ConfigItem; }) {
    const existing = this.findComponent(id);

    if (existing) {
      // update its data
      const plugin = this.getPlugin(pluginId);
      existing.executeImport(plugin, { config, external });
      return existing;
    }

    const componentData: CoreComponentData = {
      definition: { type: 'plugin', id: pluginId},
      position: { x: 1, y: 1 },
      config,
      external,
    };

    const component = this.registerComponent(id, componentData);
    this.data.components[component.id] = component.data;

    return component;
  }
}
