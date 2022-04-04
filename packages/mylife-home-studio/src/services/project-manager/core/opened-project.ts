import { logger } from 'mylife-home-common';
import {
  ApplyDeployToOnlineCoreProjectCall,
  ApplyBulkUpdatesCoreProject,
  ClearBindingCoreProjectCall,
  ClearComponentsCoreProjectCall,
  ClearCoreBindingNotification,
  ClearCoreComponentNotification,
  SetCorePluginNotification,
  ClearCorePluginNotification,
  ConfigureComponentCoreProjectCall,
  CoreProject,
  CoreProjectCall,
  CoreToolboxDisplay,
  MoveComponentsCoreProjectCall,
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
  PrepareImportFromOnlineCoreProjectCall,
  PrepareImportFromProjectCoreProjectCall,
  PrepareBulkUpdatesCoreProjectCallResult,
  ApplyBulkUpdatesCoreProjectCallResult,
  ValidateCoreProjectCallResult,
  PrepareDeployToFilesCoreProjectCallResult,
  ApplyDeployToFilesCoreProjectCall,
  ApplyDeployToFilesCoreProjectCallResult,
  SetTemplateCoreProjectCall,
  ClearTemplateCoreProjectCall,
  SetTemplateExportCoreProjectCall,
  ClearTemplateExportCoreProjectCall,
  RenameTemplateCoreProjectCall,
  SetCoreTemplateNotification,
  ClearCoreTemplateNotification,
  RenameCoreTemplateNotification,
} from '../../../../shared/project-manager';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { CoreProjects } from './projects';
import { BindingModel, ComponentModel, ProjectModel, TemplateModel, ViewModel, ResolvedProjectView } from './model';
import { Services } from '../..';
import { applyChanges, ComponentImport, ImportData, loadOnlineData, loadProjectData, PluginImport, prepareChanges, UpdateServerData } from './import';
import { applyToFiles, applyToOnline, prepareToFiles, prepareToOnline } from './deploy';
import { validate } from './validation';
import { resolveProject } from './resolver';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:opened-project');

export class CoreOpenedProject extends OpenedProject {
  private model: ProjectModel;
  private project: CoreProject;
  private _cachedResolved: ResolvedProjectView;

  constructor(private readonly owner: CoreProjects, name: string) {
    super('core', name);
    this.reloadModel();
  }

  protected reloadModel() {
    this.project = this.owner.getProject(this.name);
    this.model = new ProjectModel(this.project);
    this._cachedResolved = null;
  }

  get view() {
    if (!this._cachedResolved) {
      this._cachedResolved = resolveProject(this.model);
    }

    return this._cachedResolved;
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify<SetCorePluginsNotification>({ operation: 'set-core-plugins', plugins: this.project.plugins });

    const views: ViewModel[] = [this.model];

    for (const id of this.model.getTemplatesIds()) {
      const template = this.model.getTemplate(id);
      notifier.notify<SetCoreTemplateNotification>({ operation: 'set-core-template', id: template.id, exports: template.data.exports });

      views.push(template);
    }

    for (const view of views) {
      for (const id of view.getComponentsIds()) {
        const component = view.getComponent(id);
        const templateId = component.ownerTemplate?.id || null;
        notifier.notify<SetCoreComponentNotification>({ operation: 'set-core-component', templateId, id: component.id, component: component.data });
      }
  
      for (const id of view.getBindingsIds()) {
        const binding = view.getBinding(id);
        const templateId = binding.ownerTemplate?.id || null;
        notifier.notify<SetCoreBindingNotification>({ operation: 'set-core-binding', templateId, id: binding.id, binding: binding.data });
      }
    }
  }

  async call(callData: CoreProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'update-toolbox':
        this.updateToolbox(callData as UpdateToolboxCoreProjectCall);
        break;

      case 'set-template':
        this.setTemplate(callData as SetTemplateCoreProjectCall);
        break;

      case 'clear-template':
        this.clearTemplate(callData as ClearTemplateCoreProjectCall);
        break;
  
      case 'rename-template':
        this.renameTemplate(callData as RenameTemplateCoreProjectCall);
        break;
        
      case 'set-template-export':
        this.setTemplateExport(callData as SetTemplateExportCoreProjectCall);
        break;

      case 'clear-template-export':
        this.clearTemplateExport(callData as ClearTemplateExportCoreProjectCall);
        break;
    
      case 'set-component':
        this.setComponent(callData as SetComponentCoreProjectCall);
        break;

      case 'move-components':
        this.moveComponents(callData as MoveComponentsCoreProjectCall);
        break;

      case 'configure-component':
        this.configureComponent(callData as ConfigureComponentCoreProjectCall);
        break;

      case 'rename-component':
        this.renameComponent(callData as RenameComponentCoreProjectCall);
        break;

      case 'clear-components':
        this.clearComponents(callData as ClearComponentsCoreProjectCall);
        break;

      case 'set-binding':
        this.setBinding(callData as SetBindingCoreProjectCall);
        break;

      case 'clear-binding':
        this.clearBinding(callData as ClearBindingCoreProjectCall);
        break;

      case 'prepare-import-from-project':
        return this.prepareImportFromProject(callData as PrepareImportFromProjectCoreProjectCall);

      case 'prepare-import-from-online':
        return this.prepareImportFromOnline(callData as PrepareImportFromOnlineCoreProjectCall);

      case 'apply-bulk-updates':
        return this.applyBulkUpdates(callData as ApplyBulkUpdatesCoreProject);

      case 'validate':
        return this.validate();

      case 'prepare-deploy-to-files':
        return this.prepareDeployToFiles();

      case 'apply-deploy-to-files':
        return await this.applyDeployToFiles(callData as ApplyDeployToFilesCoreProjectCall);
    
      case 'prepare-deploy-to-online':
        return await this.prepareDeployToOnline();

      case 'apply-deploy-to-online':
        await this.applyDeployToOnline(callData as ApplyDeployToOnlineCoreProjectCall);
        break;

      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private executeUpdate<TResult>(updater: () => TResult) {
    this._cachedResolved = null;
    return this.owner.update(this.name, updater);
  }

  private notifyAllSetPlugins() {
    this.notifyAll<SetCorePluginsNotification>({ operation: 'set-core-plugins', plugins: this.project.plugins });
  }

  private notifyAllSetPluginDisplay(id: string, display: CoreToolboxDisplay) {
    this.notifyAll<SetCorePluginToolboxDisplayNotification>({ operation: 'set-core-plugin-toolbox-display', id, display });
  }
  
  private notifyAllSetPlugin(id: string) {
    this.notifyAll<SetCorePluginNotification>({ operation: 'set-core-plugin', id, plugin: this.project.plugins[id] });
  }

  private notifyAllClearPlugin(id: string) {
    this.notifyAll<ClearCorePluginNotification>({ operation: 'clear-core-plugin', id });
  }

  private notifyAllSetTemplate(template: TemplateModel) {
    this.notifyAll<SetCoreTemplateNotification>({ operation: 'set-core-template', id: template.id, exports: template.data.exports });
  }

  private notifyAllClearTemplate(id: string) {
    this.notifyAll<ClearCoreTemplateNotification>({ operation: 'clear-core-template', id });
  }

  private notifyAllRenameTemplate(id: string, newId: string) {
    this.notifyAll<RenameCoreTemplateNotification>({ operation: 'rename-core-template', id, newId });
  }

  private notifyAllSetComponent(component: ComponentModel) {
    const templateId = component.ownerTemplate?.id || null;
    this.notifyAll<SetCoreComponentNotification>({ operation: 'set-core-component', templateId, id: component.id, component: component.data });
  }

  private notifyAllClearComponent(templateId: string, id: string) {
    this.notifyAll<ClearCoreComponentNotification>({ operation: 'clear-core-component', templateId, id });
  }

  private notifyAllRenameComponent(templateId: string, id: string, newId: string) {
    this.notifyAll<RenameCoreComponentNotification>({ operation: 'rename-core-component', templateId, id, newId });
  }

  private notifyAllSetBinding(binding: BindingModel) {
    const templateId = binding.ownerTemplate?.id || null;
    this.notifyAll<SetCoreBindingNotification>({ operation: 'set-core-binding', templateId, id: binding.id, binding: binding.data });
  }

  private notifyAllClearBinding(templateId: string, id: string) {
    this.notifyAll<ClearCoreBindingNotification>({ operation: 'clear-core-binding', templateId, id });
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

  private setTemplate({ templateId }: SetTemplateCoreProjectCall) {
    this.executeUpdate(() => {
      const template = this.model.setTemplate(templateId);
      this.notifyAllSetTemplate(template);
    });
  }

  private clearTemplate({ templateId }: ClearTemplateCoreProjectCall) {
    this.executeUpdate(() => {
      this.model.clearTemplate(templateId);
      this.notifyAllClearTemplate(templateId);
    });
  }

  private renameTemplate({ templateId, newId }: RenameTemplateCoreProjectCall) {
    this.executeUpdate(() => {
      this.model.renameTemplate(templateId, newId);
      this.notifyAllRenameTemplate(templateId, newId);
    });
  }

  private setTemplateExport({ templateId, exportType, exportId, componentId, propertyName }: SetTemplateExportCoreProjectCall) {
    this.executeUpdate(() => {
      const template = this.model.getTemplate(templateId);
      const { updatedComponents } = template.setExport(exportType, exportId, componentId, propertyName);

      this.notifyAllSetTemplate(template);
      for (const component of updatedComponents) {
        this.notifyAllSetComponent(component);
      }
    });
  }

  private clearTemplateExport({ templateId, exportType, exportId }: ClearTemplateExportCoreProjectCall) {
    this.executeUpdate(() => {
      const template = this.model.getTemplate(templateId);
      const { updatedComponents } = template.clearExport(exportType, exportId);
      
      this.notifyAllSetTemplate(template);
      for (const component of updatedComponents) {
        this.notifyAllSetComponent(component);
      }
    });
  }

  private setComponent({ templateId, componentId, definition, x, y }: SetComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      const component = view.setComponent(componentId, definition, x, y);
      this.notifyAllSetComponent(component);
    });
  }

  private moveComponents({ templateId, componentsIds, delta }: MoveComponentsCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      for (const componentId of componentsIds) {
        const component = view.getComponent(componentId);
        component.move(delta);
        this.notifyAllSetComponent(component);
      }
    });
  }

  private configureComponent({ templateId, componentId, configId, configValue }: ConfigureComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      const component = view.getComponent(componentId);
      component.configure(configId, configValue);
      this.notifyAllSetComponent(component);
    });
  }

  private renameComponent({ templateId, componentId, newId }: RenameComponentCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      const component = view.getComponent(componentId);
      // Ids will be updated while renaming, need to get them before
      const bindingIds = Array.from(component.getAllBindingsIds());

      view.renameComponent(componentId, newId);

      for (const bindingId of bindingIds) {
        this.notifyAllClearBinding(templateId, bindingId);
      }

      this.notifyAllRenameComponent(templateId, componentId, newId);

      for (const binding of component.getAllBindings()) {
        this.notifyAllSetBinding(binding);
      }

      if (view instanceof TemplateModel && view.hasExportWithComponentId(newId)) {
        this.notifyAllSetTemplate(view);
      }
    });
  }

  private clearComponents({ templateId, componentsIds }: ClearComponentsCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);

      for (const componentId of componentsIds) {
        const component = view.getComponent(componentId);
        component.checkDelete();
      }

      for (const componentId of componentsIds) {
        const component = view.getComponent(componentId);
        for (const binding of component.getAllBindings()) {
          view.clearBinding(binding.id);
          this.notifyAllClearBinding(templateId, binding.id);
        }
  
        view.clearComponent(componentId);
        this.notifyAllClearComponent(templateId, componentId);
      }
    });
  }

  private setBinding({ templateId, binding: bindingData }: SetBindingCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      const binding = view.setBinding(bindingData);
      this.notifyAllSetBinding(binding);
    });
  }

  private clearBinding({ templateId, bindingId }: ClearBindingCoreProjectCall) {
    this.executeUpdate(() => {
      const view = this.model.getTemplateOrSelf(templateId);
      view.clearBinding(bindingId);
      this.notifyAllClearBinding(templateId, bindingId);
    });
  }

  private prepareImportFromProject({ config }: PrepareImportFromProjectCoreProjectCall) {
    const imports = Services.instance.projectManager.executeOnProject('core', config.projectId, project => {
      const coreProject = project as CoreOpenedProject;
      return loadProjectData(coreProject.view, config);
    });

    return this.prepareBulkUpdates(imports);
  }

  private prepareImportFromOnline({ config }: PrepareImportFromOnlineCoreProjectCall) {
    const imports = loadOnlineData(config);
    return this.prepareBulkUpdates(imports);
  }

  private prepareBulkUpdates(imports: ImportData): PrepareBulkUpdatesCoreProjectCallResult {
    const { changes, serverData } = prepareChanges(imports, this.model);
    return { changes, serverData };
  }

  private applyBulkUpdates({ selection, serverData }: ApplyBulkUpdatesCoreProject): ApplyBulkUpdatesCoreProjectCallResult {
    // Note: we do not import into templates, so all components are on project directly
    const api = {
      clearPlugin: (pluginId: string) => {
        this.model.deletePlugin(pluginId);
        this.notifyAllClearPlugin(pluginId);
      },
      clearComponent: (componentId: string) => {
        this.model.clearComponent(componentId);
        this.notifyAllClearComponent(null, componentId);
      },
      clearBinding: (bindingId: string) => {
        this.model.clearBinding(bindingId);
        this.notifyAllClearBinding(null, bindingId);
      },
      setPlugin: ({ instanceName, plugin }: PluginImport) => {
        const pluginModel = this.model.importPlugin(instanceName, plugin);
        this.notifyAllSetPlugin(pluginModel.id);
      },
      setComponent: ({ id, pluginId, external, config }: ComponentImport) => {
        const componentModel = this.model.importComponent(id, pluginId, external, config);
        this.notifyAllSetComponent(componentModel);
      },
    };

    const stats = this.executeUpdate(() => applyChanges(serverData as UpdateServerData, new Set(selection), api));

    return { stats };
  }

  private validate(): ValidateCoreProjectCallResult {
    const validation = validate(this.view, { onlineSeverity: 'error', checkBindingApi: true });
    return { validation };
  }

  private prepareDeployToFiles(): PrepareDeployToFilesCoreProjectCallResult {
    return prepareToFiles(this.view);
  }

  private async applyDeployToFiles({ bindingsInstanceName, serverData }: ApplyDeployToFilesCoreProjectCall): Promise<ApplyDeployToFilesCoreProjectCallResult> {
    const writtenFilesCount = await applyToFiles(this.view, bindingsInstanceName, serverData);
    return { writtenFilesCount };
  }

  private async prepareDeployToOnline(): Promise<PrepareDeployToOnlineCoreProjectCallResult> {
    return await prepareToOnline(this.view);
  }

  private async applyDeployToOnline({ serverData }: ApplyDeployToOnlineCoreProjectCall) {
    await applyToOnline(this.view, serverData);
  }

}
