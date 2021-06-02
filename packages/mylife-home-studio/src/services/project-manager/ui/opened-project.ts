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
  SetWindowUiProjectCall,
  SetUiWindowNotification,
  ClearWindowUiProjectCall,
  ClearUiWindowNotification,
  RenameWindowUiProjectCall,
  RenameUiWindowNotification,
  SetUiComponentDataNotification,
  ProjectCallResult,
  ValidateUiProjectCallResult,
  RefreshComponentsFromProjectUiProjectCall,
  RefreshComponentsUiProjectCallResult,
  ApplyRefreshComponentsUiProjectCall,
  UiComponentData,
  DeployUiProjectCallResult,
} from '../../../../shared/project-manager';
import { Window, DefinitionResource } from '../../../../shared/ui-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { Services } from '../..';
import { UiProjects } from './projects';
import { ComponentsModel, loadCoreProjectComponentData, loadOnlineComponentData, prepareMergeComponentData } from './component-model';
import { Mutable, CollectionModel, DefaultWindowModel, WindowModel, ResourceModel, ValidationContext, ComponentUsage } from './definition-model';

const log = logger.createLogger('mylife:home:studio:services:project-manager:ui:opened-project');

export class UiOpenedProject extends OpenedProject {
  private project: UiProject;
  private defaultWindow: DefaultWindowModel;
  private windows: CollectionModel<Mutable<Window>, WindowModel>;
  private resources: CollectionModel<Mutable<DefinitionResource>, ResourceModel>;
  private components: ComponentsModel;

  constructor(private readonly owner: UiProjects, name: string) {
    super('ui', name);
    this.reloadModel();
  }

  protected reloadModel() {
    this.project = this.owner.getProject(this.name);

    this.defaultWindow = new DefaultWindowModel(this.project.definition.defaultWindow);
    this.windows = new CollectionModel(this.project.definition.windows, WindowModel);
    this.resources = new CollectionModel(this.project.definition.resources, ResourceModel);
    this.components = new ComponentsModel(this.project.componentData);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-ui-default-window', defaultWindow: this.project.definition.defaultWindow } as SetUiDefaultWindowNotification);
    notifier.notify({ operation: 'set-ui-component-data', componentData: this.project.componentData } as SetUiComponentDataNotification);

    for (const resource of this.project.definition.resources) {
      notifier.notify({ operation: 'set-ui-resource', resource } as SetUiResourceNotification);
    }

    for (const window of this.project.definition.windows) {
      notifier.notify({ operation: 'set-ui-window', window } as SetUiWindowNotification);
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

      case 'set-window':
        this.setWindow(callData as SetWindowUiProjectCall);
        break;

      case 'clear-window':
        this.clearWindow(callData as ClearWindowUiProjectCall);
        break;

      case 'rename-window':
        this.renameWindow(callData as RenameWindowUiProjectCall);
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
    this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window: window.data });
  }

  private notifyAllComponentData() {
    this.notifyAll<SetUiComponentDataNotification>({ operation: 'set-ui-component-data', componentData: this.project.componentData });
  }

  private setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    this.executeUpdate(() => {
      this.defaultWindow.set(defaultWindow);
      this.notifyAllDefaultWindow();
    });
  }

  private setResource({ resource }: SetResourceUiProjectCall) {
    this.executeUpdate(() => {
      this.resources.set(resource);
      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', resource });
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
    });
  }

  private setWindow({ window }: SetWindowUiProjectCall) {
    this.executeUpdate(() => {
      const model = this.windows.set(window);
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

  private prepareComponentRefresh(componentData: UiComponentData) {
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

    const uiInstances = Services.instance.online.getInstancesByCapability('ui-manager');
    if (uiInstances.length === 0) {
      return { deployError: `Pas d'instance UI en ligne pour deployer` };
    }

    if (uiInstances.length > 1) {
      return { deployError: 'Il y a plusieurs instances UI en ligne. Non supporté' };
    }

    const [instanceName] = uiInstances;
    const { definition } = this.project;

    try {
      await Services.instance.online.uiSetDefinition(instanceName, definition);
    } catch(err) {
      log.error(err, `Error deploying project on instance '${instanceName}'`);
      return { deployError: err.message };
    }

    return {};
  }
}

interface RefreshServerData {
  componentData: UiComponentData;
  usageToClear: ComponentUsage[];
}
