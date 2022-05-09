import { logger } from 'mylife-home-common';
import {
  UiProject,
  UiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetUiDefaultWindowNotification,
  SetResourceUiProjectCall,
  SetUiResourceNotification,
  ClearResourceUiProjectCall,
  ClearUiResourceNotification,
  RenameResourceUiProjectCall,
  RenameUiResourceNotification,
  SetUiWindowNotification,
  ClearWindowUiProjectCall,
  ClearUiWindowNotification,
  RenameWindowUiProjectCall,
  RenameUiWindowNotification,
  CloneWindowUiProjectCall,
  ClearControlUiProjectCall,
  RenameControlUiProjectCall,
  SetUiComponentDataNotification,
  ProjectCallResult,
  ValidateUiProjectCallResult,
  RefreshComponentsFromProjectUiProjectCall,
  RefreshComponentsUiProjectCallResult,
  ApplyRefreshComponentsUiProjectCall,
  UiComponentData,
  DeployUiProjectCallResult,
  NewWindowUiProjectCall,
  SetWindowPropertiesUiProjectCall,
  NewControlUiProjectCall,
  SetControlPropertiesUiProjectCall,
  CloneControlUiProjectCall,
  SetStyleUiProjectCall,
  ClearStyleUiProjectCall,
  RenameStyleUiProjectCall,
  SetUiStyleNotification,
  ClearUiStyleNotification,
  RenameUiStyleNotification,
  UiResourceData,
  UiStyleData,
  UiWindowData,
  UiTemplateData,
} from '../../../../shared/project-manager';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { Services } from '../..';
import { UiProjects } from './projects';
import { ComponentsModel, loadCoreProjectComponentData, loadOnlineComponentData, NewComponentData, prepareMergeComponentData } from './component-model';
import { CollectionModel, DefaultWindowModel, WindowModel, ResourceModel, ValidationContext, ComponentUsage, newWindow, StyleModel, TemplateModel } from './definition-model';
import { clone } from '../../../utils/object-utils';
import { buildDeployDefinition } from './deploy';

const log = logger.createLogger('mylife:home:studio:services:project-manager:ui:opened-project');

interface RefreshServerData {
  componentData: NewComponentData;
  usageToClear: ComponentUsage[];
}

export class UiOpenedProject extends OpenedProject {
  private project: UiProject;
  private defaultWindow: DefaultWindowModel;
  private windows: CollectionModel<UiWindowData, WindowModel>;
  private templates: CollectionModel<UiTemplateData, TemplateModel>;
  private resources: CollectionModel<UiResourceData, ResourceModel>;
  private styles: CollectionModel<UiStyleData, StyleModel>;
  private components: ComponentsModel;

  constructor(private readonly owner: UiProjects, name: string) {
    super('ui', name);
    this.reloadModel();
  }

  protected reloadModel() {
    this.project = this.owner.getProject(this.name);

    this.defaultWindow = new DefaultWindowModel(this.project.defaultWindow);
    this.windows = new CollectionModel(this.project.windows, WindowModel);
    this.templates = new CollectionModel(this.project.templates, TemplateModel);
    this.resources = new CollectionModel(this.project.resources, ResourceModel);
    this.styles = new CollectionModel(this.project.styles, StyleModel);
    this.components = new ComponentsModel({ components: this.project.components, plugins: this.project.plugins });
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-ui-default-window', defaultWindow: this.project.defaultWindow } as SetUiDefaultWindowNotification);
    notifier.notify({ operation: 'set-ui-component-data', components: this.project.components, plugins: this.project.plugins } as SetUiComponentDataNotification);

    for (const [id, resource] of Object.entries(this.project.resources)) {
      notifier.notify({ operation: 'set-ui-resource', id, resource } as SetUiResourceNotification);
    }

    for (const [id, style] of Object.entries(this.project.styles)) {
      notifier.notify({ operation: 'set-ui-style', id, style } as SetUiStyleNotification);
    }

    for (const [id, window] of Object.entries(this.project.windows)) {
      notifier.notify({ operation: 'set-ui-window', id, window } as SetUiWindowNotification);
    }
  }

  async call(callData: UiProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'validate':
        return this.validate();

      case 'refresh-components-from-online':
        return this.refreshComponentsFromOnline();

      case 'refresh-components-from-project':
        return this.refreshComponentsFromProject(callData as RefreshComponentsFromProjectUiProjectCall);

      case 'apply-refresh-components':
        this.applyRefreshComponents(callData as ApplyRefreshComponentsUiProjectCall);
        break;

      case 'deploy':
        return await this.deploy();

      case 'set-default-window':
        this.setDefaultWindow(callData as SetDefaultWindowUiProjectCall);
        break;

      case 'set-resource':
        this.setResource(callData as SetResourceUiProjectCall);
        break;

      case 'clear-resource':
        this.clearResource(callData as ClearResourceUiProjectCall);
        break;

      case 'rename-resource':
        this.renameResource(callData as RenameResourceUiProjectCall);
        break;

      case 'set-style':
        this.setStyle(callData as SetStyleUiProjectCall);
        break;

      case 'clear-style':
        this.clearStyle(callData as ClearStyleUiProjectCall);
        break;

      case 'rename-style':
        this.renameStyle(callData as RenameStyleUiProjectCall);
        break;

      case 'new-window':
        this.newWindow(callData as NewWindowUiProjectCall);
        break;

      case 'clear-window':
        this.clearWindow(callData as ClearWindowUiProjectCall);
        break;

      case 'rename-window':
        this.renameWindow(callData as RenameWindowUiProjectCall);
        break;

      case 'clone-window':
        this.cloneWindow(callData as CloneWindowUiProjectCall);
        break;
  
      case 'set-window-properties':
        this.setWindowProperties(callData as SetWindowPropertiesUiProjectCall);
        break;

      case 'new-control':
        this.newControl(callData as NewControlUiProjectCall);
        break;

      case 'clear-control':
        this.clearControl(callData as ClearControlUiProjectCall);
        break;

      case 'rename-control':
        this.renameControl(callData as RenameControlUiProjectCall);
        break;
        
      case 'clone-control':
        this.cloneControl(callData as CloneControlUiProjectCall);
        break;
  
      case 'set-control-properties':
        this.setControlProperties(callData as SetControlPropertiesUiProjectCall);
        break;

      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private executeUpdate<TResult>(updater: () => TResult) {
    return this.owner.update(this.name, updater);
  }

  private notifyAllDefaultWindow() {
    this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow: this.defaultWindow.data });
  }

  private notifyAllWindow(window: WindowModel) {
    this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', id: window.id, window: window.data });
  }

  private notifyAllTemplate(template: TemplateModel) {
    // TODO
  }

  private notifyAllComponentData() {
    this.notifyAll<SetUiComponentDataNotification>({ operation: 'set-ui-component-data', components: this.project.components, plugins: this.project.plugins });
  }

  private setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    this.executeUpdate(() => {
      this.defaultWindow.set(defaultWindow);
      this.notifyAllDefaultWindow();
    });
  }

  private setResource({ id, resource }: SetResourceUiProjectCall) {
    this.executeUpdate(() => {
      const existing = this.resources.findById(id);
      if (existing) {
        existing.update(resource);
      } else {
        this.resources.set(id, resource);
      }

      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', id, resource });
    });
  }

  private clearResource({ id }: ClearResourceUiProjectCall) {
    this.executeUpdate(() => {
      this.resources.clear(id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });

      for (const window of this.windows) {
        if (window.onClearResource(id)) {
          this.notifyAllWindow(window);
        }
      }

      for (const template of this.templates) {
        if (template.onClearResource(id)) {
          this.notifyAllTemplate(template);
        }
      }
    });
  }

  private renameResource({ id, newId }: RenameResourceUiProjectCall) {
    this.executeUpdate(() => {
      this.resources.rename(id, newId);
      this.notifyAll<RenameUiResourceNotification>({ operation: 'rename-ui-resource', id, newId });

      for (const window of this.windows) {
        if (window.onRenameResource(id, newId)) {
          this.notifyAllWindow(window);
        }
      }

      for (const template of this.templates) {
        if (template.onRenameResource(id, newId)) {
          this.notifyAllTemplate(template);
        }
      }
    });
  }

  private setStyle({ id, style }: SetStyleUiProjectCall) {
    this.executeUpdate(() => {
      const existing = this.styles.findById(id);
      if (existing) {
        existing.update(style);
      } else {
        this.styles.set(id, style);
      }
      
      this.notifyAll<SetUiStyleNotification>({ operation: 'set-ui-style', id, style });
    });
  }

  private clearStyle({ id }: ClearStyleUiProjectCall) {
    this.executeUpdate(() => {
      this.styles.clear(id);
      this.notifyAll<ClearUiStyleNotification>({ operation: 'clear-ui-style', id });

      for (const window of this.windows) {
        if (window.onClearStyle(id)) {
          this.notifyAllWindow(window);
        }
      }

      for (const template of this.templates) {
        if (template.onClearStyle(id)) {
          this.notifyAllTemplate(template);
        }
      }
    });
  }

  private renameStyle({ id, newId }: RenameStyleUiProjectCall) {
    this.executeUpdate(() => {
      this.styles.rename(id, newId);
      this.notifyAll<RenameUiStyleNotification>({ operation: 'rename-ui-style', id, newId });

      for (const window of this.windows) {
        if (window.onRenameStyle(id, newId)) {
          this.notifyAllWindow(window);
        }
      }

      for (const template of this.templates) {
        if (template.onRenameStyle(id, newId)) {
          this.notifyAllTemplate(template);
        }
      }
    });
  }

  private newWindow({ id }: NewWindowUiProjectCall) {
    this.executeUpdate(() => {
      const model = newWindow(this.windows, id);
      this.notifyAllWindow(model);
    });
  }

  private clearWindow({ id }: ClearWindowUiProjectCall) {
    this.executeUpdate(() => {
      this.windows.clear(id);
      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });

      if (this.defaultWindow.onClearWindow(id)) {
        this.notifyAllDefaultWindow();
      }

      for (const window of this.windows) {
        if (window.onClearWindow(id)) {
          this.notifyAllWindow(window);
        }
      }
    });
  }

  private renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    this.executeUpdate(() => {
      this.windows.rename(id, newId);
      this.notifyAll<RenameUiWindowNotification>({ operation: 'rename-ui-window', id, newId });

      if (this.defaultWindow.onRenameWindow(id, newId)) {
        this.notifyAllDefaultWindow();
      }

      for (const window of this.windows) {
        if (window.onRenameWindow(id, newId)) {
          this.notifyAllWindow(window);
        }
      }
    });
  }

  private cloneWindow({ id, newId }: CloneWindowUiProjectCall) {
    this.executeUpdate(() => {
      const source = this.windows.getById(id);
      const newWindow = clone(source.data);
      const model = this.windows.set(newId, newWindow);
      this.notifyAllWindow(model);
    });
  }

  private setWindowProperties({ id, properties }: SetWindowPropertiesUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(id);
      windowModel.update(properties);
      this.notifyAllWindow(windowModel);
    });
  }

  private newControl({ windowId, id, x, y }: NewControlUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(windowId);
      windowModel.newControl(id, x, y);
      this.notifyAllWindow(windowModel);
    });
  }

  private clearControl({ windowId, id }: ClearControlUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(windowId);
      windowModel.clearControl(id);
      this.notifyAllWindow(windowModel);
    });
  }

  private renameControl({ windowId, id, newId }: RenameControlUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(windowId);
      windowModel.renameControl(id, newId);
      this.notifyAllWindow(windowModel);
    });
  }

  private cloneControl({ windowId, id, newId }: CloneControlUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(windowId);
      windowModel.cloneControl(id, newId);
      this.notifyAllWindow(windowModel);
    });
  }

  private setControlProperties({ windowId, id, properties }: SetControlPropertiesUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.windows.getById(windowId);
      const controlModel = windowModel.getControl(id);
      controlModel.update(properties);
      this.notifyAllWindow(windowModel);
    });
  }

  private validate(): ValidateUiProjectCallResult {
    const context = new ValidationContext(this.windows, this.resources, this.components);

    this.defaultWindow.validate(context);
    for (const window of this.windows) {
      window.validate(context);
    }

    return { errors: context.errors };
  }

  private refreshComponentsFromOnline(): RefreshComponentsUiProjectCallResult {
    const componentData = loadOnlineComponentData();
    return this.prepareComponentRefresh(componentData);
  }

  private refreshComponentsFromProject({ projectId }: RefreshComponentsFromProjectUiProjectCall): RefreshComponentsUiProjectCallResult {
    const componentData = Services.instance.projectManager.executeOnProject('core', projectId, loadCoreProjectComponentData);
    return this.prepareComponentRefresh(componentData);
  }

  private prepareComponentRefresh(componentData: NewComponentData) {
    const usage = this.collectComponentsUsage();
    const { breakingOperations, usageToClear } = prepareMergeComponentData(this.components, usage, componentData);
    const serverData: RefreshServerData = { componentData, usageToClear };
    return { breakingOperations, serverData };
  }

  private collectComponentsUsage() {
    const usage: ComponentUsage[] = [];

    for (const window of this.windows) {
      window.collectComponentsUsage(usage);
    }

    return usage;
  }

  private applyRefreshComponents({ serverData }: ApplyRefreshComponentsUiProjectCall) {
    this.executeUpdate(() => {
      const { componentData, usageToClear } = serverData as RefreshServerData;
      this.components.apply(componentData);
      this.clearComponentsUsage(usageToClear);
      this.notifyAllComponentData();
    });
  }

  private clearComponentsUsage(usage: ComponentUsage[]) {
    for (const item of usage) {
      const node = item.path[0];
      if (node.type !== 'window') {
        continue; // paranoia
      }

      const window = this.windows.findById(node.id);
      const changed = window.clearComponentUsage(item);
      if (changed) {
        this.notifyAllWindow(window);
      }
    }
  }

  private async deploy(): Promise<DeployUiProjectCallResult> {
    const validation = await this.validate();

    // only deploy if no validation errors
    if (validation.errors.length > 0) {
      return { validationErrors: validation.errors };
    }

    const uiInstances = Services.instance.online.getInstancesByCapability('ui-api');
    if (uiInstances.length === 0) {
      return { deployError: `Pas d'instance UI en ligne pour deployer` };
    }

    if (uiInstances.length > 1) {
      return { deployError: 'Il y a plusieurs instances UI en ligne. Non supporté' };
    }

    const [instanceName] = uiInstances;
    const definition = buildDeployDefinition(this.project);

    try {
      await Services.instance.online.uiSetDefinition(instanceName, definition);
    } catch(err) {
      log.error(err, `Error deploying project on instance '${instanceName}'`);
      return { deployError: err.message };
    }

    return {};
  }
}
