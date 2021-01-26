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
  PluginData,
  ComponentData,
} from '../../../../shared/project-manager';
import { Definition, Window, DefinitionResource, DefaultWindow } from '../../../../shared/ui-model';
import { Component } from '../../../../shared/component-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { UiProjects } from './projects';

export class UiOpenedProject extends OpenedProject {
  private readonly defaultWindow: DefaultWindow;
  private readonly windows: Collection<Mutable<Window>>;
  private readonly resources: Collection<Mutable<DefinitionResource>>;
  private readonly components = new Map<string, ComponentModel>();

  constructor(private owner: UiProjects, name: string, private readonly project: UiProject) {
    super('ui', name);

    this.defaultWindow = project.definition.defaultWindow;
    this.windows = new Collection(project.definition.windows);
    this.resources = new Collection(project.definition.resources);
    ComponentModel.rebuild(this.components, project.componentData);
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
        throw new Error(`Unhandle call: ${callData.operation}`);

      // TODO renames propage
      // TODO: handle deletion of used objects
    }

    // by default return nothing
    return null;
  }

  private async executeUpdate(updater: () => void) {
    await this.owner.update(this.name, updater);
  }

  private async setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    await this.executeUpdate(() => {
      Object.assign(this.defaultWindow, defaultWindow);
      this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow });
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
      // TODO: check usage
      this.resources.clear(id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });
    });
  }

  private async renameResource({ id, newId }: RenameResourceUiProjectCall) {
    await this.executeUpdate(() => {
      throw new Error('TODO');
      //arrayClear(definition.resources, id);
      this.notifyAll<RenameUiResourceNotification>({ operation: 'rename-ui-resource', id, newId });
    });
  }

  private async setWindow({ window }: SetWindowUiProjectCall) {
    await this.executeUpdate(() => {
      this.windows.set(window);
      this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window });
    });
  }

  private async clearWindow({ id }: ClearWindowUiProjectCall) {
    await this.executeUpdate(() => {
      // TODO: check usage
      this.windows.clear(id);
      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });
    });
  }

  private async renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    await this.executeUpdate(() => {
      throw new Error('TODO');
      //arrayClear(definition.windows, id);
      this.notifyAll<RenameUiWindowNotification>({ operation: 'rename-ui-window', id, newId });
    });
  }

  private async validate(): Promise<ValidateUiProjectCallResult> {
    return {
      errors: []
    };
  }

  // TODO
  private async refreshComponents() {
    ComponentModel.rebuild(this.components, this.project.componentData);
  }
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

interface WithId {
  id: string;
}

class Collection<T extends WithId> {
  private readonly map = new Map<string, { item: T, index: number; }>();

  constructor(private readonly array: T[]) {
    for (const [index, item] of array.entries()) {
      this.map.set(item.id, { item, index });
    }
  }

  findById(id: string) {
    return this.map.get(id);
  }

  findByIndex(index: number) {
    return this.array[index];
  }

  // push at the end of array, or replace if id exists
  set(item: T) {
    const mapItem = this.map.get(item.id);
    if (mapItem) {
      // replace
      mapItem.item = item;
      this.array[mapItem.index] = item;
    } else {
      // push
      const index = this.array.length;
      this.array.push(item);
      this.map.set(item.id, { item, index });
    }
  }

  clear(id: string) {
    const mapItem = this.map.get(id);
    if (!mapItem) {
      return false;
    }

    this.map.delete(id);
    this.array.splice(mapItem.index, 1);
    return true;
  }

  rename(id: string, newId: string) {
    const mapItem = this.map.get(id);
    if (!mapItem) {
      return false;
    }

    this.map.delete(id);
    mapItem.item.id = newId;
    this.map.set(id, mapItem);
    return true;
  }
}

class ComponentModel {
  static rebuild(model: Map<string, ComponentModel>, componentData: ComponentData) {
    model.clear();

    for (const component of componentData.components) {
      const plugin = componentData.plugins[component.plugin];
      const item = new ComponentModel(component, plugin);
      model.set(item.id, item);
    }
  }

  constructor(private readonly component: Component, private readonly plugin: PluginData) {
  }

  get id() {
    return this.component.id;
  }

  // TODO: accessors
}