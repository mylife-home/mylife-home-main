import { logger, components } from 'mylife-home-common';
import {
  ApplyDeployToOnlineCoreProjectCall,
  ApplyBulkUpdatesCoreProject,
  ClearBindingCoreProjectCall,
  ClearComponentCoreProjectCall,
  ClearCoreBindingNotification,
  ClearCoreComponentNotification,
  ClearCorePluginNotification,
  ConfigureComponentCoreProjectCall,
  CoreProject,
  CoreProjectCall,
  CoreToolboxDisplay,
  DeployToFilesCoreProjectCallResult,
  MoveComponentCoreProjectCall,
  PrepareDeployToOnlineCoreProjectCallResult,
  ProjectCallResult,
  RenameComponentCoreProjectCall,
  RenameCoreComponentNotification,
  SetBindingCoreProjectCall,
  SetComponentCoreProjectCall,
  SetCoreBindingNotification,
  SetCoreComponentNotification,
  SetCorePluginsNotification,
  SetCorePluginToolboxDisplayNotification,
  UpdateToolboxCoreProjectCall,
  PrepareImportFromProjectCoreProjectCall,
  PrepareBulkUpdateCoreProjectCallResult,
  ImportFromProjectConfig,
} from '../../../../shared/project-manager';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { CoreProjects } from './projects';
import { Model } from './model';
import { Services } from '../..';
import { pick, clone } from '../../../utils/object-utils';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:opened-project');

export class CoreOpenedProject extends OpenedProject {
  private model: Model;
  private project: CoreProject;

  constructor(private readonly owner: CoreProjects, name: string) {
    super('core', name);
    this.reloadModel();
  }

  protected reloadModel() {
    this.project = this.owner.getProject(this.name);
    this.model = new Model(this.project);
  }

  getComponentsIds() {
    return Object.keys(this.project.components);
  }

  getComponentModel(id: string) {
    return this.model.getComponent(id);
  }

  getPluginsIds() {
    return Object.keys(this.project.plugins);
  }

  getPluginModel(id: string) {
    return this.model.getPlugin(id);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-core-plugins', plugins: this.project.plugins } as SetCorePluginsNotification);

    for (const [id, component] of Object.entries(this.project.components)) {
      notifier.notify({ operation: 'set-core-component', id, component } as SetCoreComponentNotification);
    }

    for (const [id, binding] of Object.entries(this.project.bindings)) {
      notifier.notify({ operation: 'set-core-binding', id, binding } as SetCoreBindingNotification);
    }
  }

  async call(callData: CoreProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'update-toolbox':
        this.updateToolbox(callData as UpdateToolboxCoreProjectCall);
        break;

      case 'set-component':
        this.setComponent(callData as SetComponentCoreProjectCall);
        break;

      case 'move-component':
        this.moveComponent(callData as MoveComponentCoreProjectCall);
        break;

      case 'configure-component':
        this.configureComponent(callData as ConfigureComponentCoreProjectCall);
        break;

      case 'rename-component':
        this.renameComponent(callData as RenameComponentCoreProjectCall);
        break;

      case 'clear-component':
        this.clearComponent(callData as ClearComponentCoreProjectCall);
        break;

      case 'set-binding':
        this.setBinding(callData as SetBindingCoreProjectCall);
        break;

      case 'clear-binding':
        this.clearBinding(callData as ClearBindingCoreProjectCall);
        break;

      case 'prepare-import-from-project':
        return this.prepareImportFromProject(callData as PrepareImportFromProjectCoreProjectCall);

      case 'prepare-refresh-toolbox-from-online':
        return this.prepareRefreshToolboxFromOnline();

      case 'apply-bulk-updates':
        this.applyBulkUpdates(callData as ApplyBulkUpdatesCoreProject);

      case 'deploy-to-files':
        return this.deployToFiles();
      
      case 'prepare-deploy-to-online':
        return this.prepareDeployToOnline();

      case 'apply-deploy-to-online':
        this.applyDeployToOnline(callData as ApplyDeployToOnlineCoreProjectCall);

      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private executeUpdate(updater: () => void) {
    this.owner.update(this.name, updater);
  }

  private notifyAllSetPlugins() {
    this.notifyAll<SetCorePluginsNotification>({ operation: 'set-core-plugins', plugins: this.project.plugins });
  }

  private notifyAllSetPluginDisplay(id: string, display: CoreToolboxDisplay) {
    this.notifyAll<SetCorePluginToolboxDisplayNotification>({ operation: 'set-core-plugin-toolbox-display', id, display });
  }

  private notifyAllClearPlugin(id: string) {
    this.notifyAll<ClearCorePluginNotification>({ operation: 'clear-core-plugin', id });
  }

  private notifyAllSetComponent(id: string) {
    this.notifyAll<SetCoreComponentNotification>({ operation: 'set-core-component', id, component: this.project.components[id] });
  }

  private notifyAllClearComponent(id: string) {
    this.notifyAll<ClearCoreComponentNotification>({ operation: 'clear-core-component', id });
  }

  private notifyAllRenameComponent(id: string, newId: string) {
    this.notifyAll<RenameCoreComponentNotification>({ operation: 'rename-core-component', id, newId });
  }

  private notifyAllSetBinding(id: string) {
    this.notifyAll<SetCoreBindingNotification>({ operation: 'set-core-binding', id, binding: this.project.bindings[id] });
  }

  private notifyAllClearBinding(id: string) {
    this.notifyAll<ClearCoreBindingNotification>({ operation: 'clear-core-binding', id });
  }

  private updateToolbox({ itemType, itemId, action }: UpdateToolboxCoreProjectCall) {
    this.executeUpdate(() => {
      switch (itemType) {
        case 'instance':
          this.updateToolboxInstance(itemId, action);
          break;

        case 'plugin':
          this.updateToolboxPlugin(itemId, action);
          break;

        default:
          throw new Error(`Unknown item type: '${itemType}'`);
      }
    });
  }

  private updateToolboxInstance(id: string, action: 'show' | 'hide' | 'delete') {
    const instance = this.model.getInstance(id);
    switch (action) {
      case 'show':
      case 'hide': {
        const pluginIds = instance.updateAllPluginsDisplay(action);
        for (const pluginId of pluginIds) {
          this.notifyAllSetPluginDisplay(pluginId, action);
        }

        break;
      }

      case 'delete': {
        const pluginIds = instance.getAllUnusedPluginIds();
        for (const pluginId of pluginIds) {
          this.model.deletePlugin(pluginId);
          this.notifyAllClearPlugin(pluginId);
        }

        break;
      }

      default:
        throw new Error(`Unknown action: '${action}'`);
    }
  }

  private updateToolboxPlugin(id: string, action: 'show' | 'hide' | 'delete') {
    const plugin = this.model.getPlugin(id);
    switch (action) {
      case 'show':
      case 'hide':
        if (plugin.updateDisplay(action)) {
          this.notifyAllSetPluginDisplay(plugin.id, action);
        }

        break;

      case 'delete':
        if (plugin.used) {
          throw new Error(`Impossible de supprimer le plugin '${plugin.id}' car il est utilisé`);
        }

        this.model.deletePlugin(plugin.id);
        this.notifyAllClearPlugin(plugin.id);

        break;

      default:
        throw new Error(`Unknown action: '${action}'`);
    }
  }

  private setComponent({ componentId, pluginId, x, y }: SetComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const component = this.model.setComponent(componentId, pluginId, x, y);
      this.notifyAllSetComponent(component.id);
    });
  }

  private moveComponent({ componentId, x, y }: MoveComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      component.move(x, y);
      this.notifyAllSetComponent(component.id);
    });
  }

  private configureComponent({ componentId, configId, configValue }: ConfigureComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      component.configure(configId, configValue);
      this.notifyAllSetComponent(component.id);
    });
  }

  private renameComponent({ componentId, newId }: RenameComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      // Ids will be updated while renaming, need to get them before
      const bindingIds = Array.from(component.getAllBindingsIds());

      this.model.renameComponent(componentId, newId);

      for (const bindingId of bindingIds) {
        this.notifyAllClearBinding(bindingId);
      }

      this.notifyAllRenameComponent(componentId, newId);

      for (const binding of component.getAllBindings()) {
        this.notifyAllSetBinding(binding.id);
      }
    });
  }

  private clearComponent({ componentId }: ClearComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const component = this.model.getComponent(componentId);
      for (const binding of component.getAllBindings()) {
        this.model.clearBinding(binding.id);
        this.notifyAllClearBinding(binding.id);
      }

      this.model.clearComponent(componentId);
      this.notifyAllClearComponent(componentId);
    });
  }

  private setBinding({ binding: bindingData }: SetBindingCoreProjectCall) {
    this.executeUpdate(() => {
      const binding = this.model.setBinding(bindingData);
      this.notifyAllSetBinding(binding.id);
    });
  }

  private clearBinding({ bindingId }: ClearBindingCoreProjectCall) {
    this.executeUpdate(() => {
      this.model.clearBinding(bindingId);
      this.notifyAllClearBinding(bindingId);
    });
  }

/*

Déploiement -> une instance est toujours déployée entièrement avec un seul projet, les composants externes sont ignorés
Import composants = composants + seulement plugins associés, sans x,y
Gérer conflits plugins : confirmation changement + prendre toujours la version la plus haute

*/

  private prepareImportFromProject({ config }: PrepareImportFromProjectCoreProjectCall) {
    const imports = Services.instance.projectManager.executeOnProject('core', config.projectId, project => loadProjectData(project as CoreOpenedProject, config));
    return this.prepareBulkUpdates(imports);
  }

  private prepareRefreshToolboxFromOnline() {
    const imports = loadOnlinePlugins();
    return this.prepareBulkUpdates(imports);
  }

  private prepareBulkUpdates(imports: ImportData): PrepareBulkUpdateCoreProjectCallResult {
    throw new Error('TODO');
  }

  private applyBulkUpdates(callData: ApplyBulkUpdatesCoreProject) {
    throw new Error('TODO');
  }

  private deployToFiles(): DeployToFilesCoreProjectCallResult {
    throw new Error('TODO');
  }
      
  private prepareDeployToOnline(): PrepareDeployToOnlineCoreProjectCallResult {
    throw new Error('TODO');
  }

  private applyDeployToOnline(callData: ApplyDeployToOnlineCoreProjectCall) {
    throw new Error('TODO');
  }

}

interface ImportData {
  plugins: PluginImport[];
  components: ComponentImport[];
}

interface ComponentImport {
  id: string;
  pluginId: string;
  external: boolean;
  config: { [name: string]: any; };
}

interface PluginImport {
  instanceName: string;
  plugin: components.metadata.NetPlugin;
}

function loadOnlinePlugins(): ImportData {
  const onlineService = Services.instance.online;
  const instanceNames = onlineService.getInstanceNames();
  const list: PluginImport[] = [];

  for (const instanceName of instanceNames) {
    const plugins = onlineService.getPlugins(instanceName);
    for (const onlinePlugin of plugins) {
      const plugin = components.metadata.encodePlugin(onlinePlugin);
      list.push({ instanceName, plugin });
    }
  }

  return { plugins: list, components: [] };
}

function loadProjectData(project: CoreOpenedProject, config: ImportFromProjectConfig): ImportData {
  const plugins = new Map<string, PluginImport>();
  const components: ComponentImport[] = [];

  if (config.importPlugins) {
    for (const id of project.getPluginsIds()) {
      ensureProjectPlugin(plugins, project, id);
    }
  }

  if(config.importComponents) {
    const external = config.importComponents === 'external';

    for (const id of project.getComponentsIds()) {
      const componentModel = project.getComponentModel(id);
      if (componentModel.data.external) {
        continue;
      }

      ensureProjectPlugin(plugins, project, componentModel.data.plugin);

      components.push({
        id: componentModel.id,
        pluginId: componentModel.plugin.id,
        external,
        config: external ? null : clone(componentModel.data.config)
      });
    }
  }

  return { plugins: Array.from(plugins.values()), components };
}

function ensureProjectPlugin(plugins: Map<string, PluginImport>, project: CoreOpenedProject, id: string): PluginImport {
  const existing = plugins.get(id);
  if (existing) {
    return existing;
  }

  const pluginModel = project.getPluginModel(id);
  const pluginImport: PluginImport = {
    instanceName: pluginModel.data.instanceName,
    plugin: {
      ...pick(pluginModel.data, 'name', 'module', 'usage', 'version', 'description'),
      members: clone(pluginModel.data.members),
      config: clone(pluginModel.data.config),
    }
  };

  plugins.set(id, pluginImport);
  return pluginImport;
}