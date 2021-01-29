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
  ComponentData,
} from '../../../../shared/project-manager';
import { Window, DefinitionResource } from '../../../../shared/ui-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { UiProjects } from './projects';
import { ComponentsModel, loadCoreProjectComponentData, loadOnlineComponentData, prepareMergeComponentData } from './component-model';
import { Mutable, CollectionModel, DefaultWindowModel, WindowModel, ResourceModel, ValidationContext, ComponentUsage } from './definition-model';

export class UiOpenedProject extends OpenedProject {
  private readonly defaultWindow: DefaultWindowModel;
  private readonly windows: CollectionModel<Mutable<Window>, WindowModel>;
  private readonly resources: CollectionModel<Mutable<DefinitionResource>, ResourceModel>;
  private readonly components: ComponentsModel;

  constructor(private owner: UiProjects, name: string, private readonly project: UiProject) {
    super('ui', name);

    this.defaultWindow = new DefaultWindowModel(project.definition.defaultWindow);
    this.windows = new CollectionModel(project.definition.windows, WindowModel);
    this.resources = new CollectionModel(project.definition.resources, ResourceModel);
    this.components = new ComponentsModel(project.componentData);
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
        return await this.validate();

      case 'refresh-components-from-online':
        return await this.refreshComponentsFromOnline();

      case 'refresh-components-from-project':
        return await this.refreshComponentsFromProject(callData as RefreshComponentsFromProjectUiProjectCall);

      case 'apply-refresh-components':
        await this.applyRefreshComponents(callData as ApplyRefreshComponentsUiProjectCall);
        break;
  
      case 'deploy':
        return await this.deploy();

      case 'set-default-window':
        await this.setDefaultWindow(callData as SetDefaultWindowUiProjectCall);
        break;

      case 'set-resource':
        await this.setResource(callData as SetResourceUiProjectCall);
        break;

      case 'clear-resource':
        await this.clearResource(callData as ClearResourceUiProjectCall);
        break;

      case 'rename-resource':
        await this.renameResource(callData as RenameResourceUiProjectCall);
        break;

      case 'set-window':
        await this.setWindow(callData as SetWindowUiProjectCall);
        break;

      case 'clear-window':
        await this.clearWindow(callData as ClearWindowUiProjectCall);
        break;

      case 'rename-window':
        await this.renameWindow(callData as RenameWindowUiProjectCall);
        break;

      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private async executeUpdate(updater: () => void) {
    await this.owner.update(this.name, updater);
  }

  private notifyAllDefaultWindow() {
    this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow: this.defaultWindow.data });
  }

  private notifyAllWindow(window: WindowModel) {
    this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window: window.data });
  }

  private async setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    await this.executeUpdate(() => {
      this.defaultWindow.set(defaultWindow);
      this.notifyAllDefaultWindow();
    });
  }

  private async setResource({ resource }: SetResourceUiProjectCall) {
    await this.executeUpdate(() => {
      this.resources.set(resource);
      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', resource });
    });
  }

  private async clearResource({ id }: ClearResourceUiProjectCall) {
    await this.executeUpdate(() => {
      this.resources.clear(id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });

      for (const window of this.windows) {
        if (window.onClearResource(id)) {
          this.notifyAllWindow(window);
        }
      }
    });
  }

  private async renameResource({ id, newId }: RenameResourceUiProjectCall) {
    await this.executeUpdate(() => {
      this.resources.rename(id, newId);
      this.notifyAll<RenameUiResourceNotification>({ operation: 'rename-ui-resource', id, newId });

      for (const window of this.windows) {
        if (window.onRenameResource(id, newId)) {
          this.notifyAllWindow(window);
        }
      }
    });
  }

  private async setWindow({ window }: SetWindowUiProjectCall) {
    await this.executeUpdate(() => {
      const model = this.windows.set(window);
      this.notifyAllWindow(model);
    });
  }

  private async clearWindow({ id }: ClearWindowUiProjectCall) {
    await this.executeUpdate(() => {
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

  private async renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    await this.executeUpdate(() => {
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

  private async validate(): Promise<ValidateUiProjectCallResult> {
    const context = new ValidationContext(this.windows, this.resources, this.components);

    this.defaultWindow.validate(context);
    for (const window of this.windows) {
      window.validate(context);
    }

    return { errors: context.errors };
  }

  private async refreshComponentsFromOnline(): Promise<RefreshComponentsUiProjectCallResult> {
    const componentData = loadOnlineComponentData();
    return this.prepareComponentRefresh(componentData);
  }

  private async refreshComponentsFromProject({ projectId }: RefreshComponentsFromProjectUiProjectCall): Promise<RefreshComponentsUiProjectCallResult> {
    const componentData = loadCoreProjectComponentData(projectId);
    return this.prepareComponentRefresh(componentData);
  }

  private async applyRefreshComponents({ serverData }: ApplyRefreshComponentsUiProjectCall) {
    await this.executeUpdate(() => {
      const { componentData, usageToClear } = serverData as RefreshServerData;
      this.components.apply(componentData);
      this.clearComponentsUsage(usageToClear);
    });
  }

  private prepareComponentRefresh(componentData: ComponentData) {
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

  private async deploy(): Promise<ProjectCallResult> {
    throw new Error('TODO');
  }
}

interface RefreshServerData {
  componentData: ComponentData;
  usageToClear: ComponentUsage[];
}
