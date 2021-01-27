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
import { Window, DefinitionResource, DefaultWindow } from '../../../../shared/ui-model';
import { Component } from '../../../../shared/component-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { UiProjects } from './projects';

export class UiOpenedProject extends OpenedProject {
  private readonly defaultWindow: DefaultWindowModel;
  private readonly windows: CollectionModel<Mutable<Window>, WindowModel>;
  private readonly resources: CollectionModel<Mutable<DefinitionResource>, ResourceModel>;
  private readonly components = new Map<string, ComponentModel>();

  constructor(private owner: UiProjects, name: string, private readonly project: UiProject) {
    super('ui', name);

    this.defaultWindow = new DefaultWindowModel(project.definition.defaultWindow);
    this.windows = new CollectionModel(project.definition.windows, WindowModel);
    this.resources = new CollectionModel(project.definition.resources, ResourceModel);
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

  private notifyAllDefaultWindow() {
    this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow: this.defaultWindow.data });
  }

  private notifyAllWindow(window: WindowModel) {
    this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window: window.data });
  }

  private async setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    await this.executeUpdate(() => {
      Object.assign(this.defaultWindow, defaultWindow);
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
        if(window.onClearResource(id)) {
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
        if(window.onRenameResource(id, newId)) {
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

      if(this.defaultWindow.onClearWindow(id)) {
        this.notifyAllDefaultWindow();
      }

      for (const window of this.windows) {
        if(window.onClearWindow(id)) {
          this.notifyAllWindow(window);
        }
      }
    });
  }

  private async renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    await this.executeUpdate(() => {
      this.windows.rename(id, newId);
      this.notifyAll<RenameUiWindowNotification>({ operation: 'rename-ui-window', id, newId });

      if(this.defaultWindow.onRenameWindow(id, newId)) {
        this.notifyAllDefaultWindow();
      }

      for (const window of this.windows) {
        if(window.onRenameWindow(id, newId)) {
          this.notifyAllWindow(window);
        }
      }
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

class CollectionModel<TData extends WithId, TModel extends WithId> {
  private readonly map = new Map<string, { item: TModel, index: number; }>();

  constructor(public readonly data: TData[], private readonly ModelFactory: new (data: TData) => TModel) {
    for (const [index, itemData] of data.entries()) {
      const item = new this.ModelFactory(itemData);
      this.map.set(item.id, { item, index });
    }
  }

  *[Symbol.iterator]() {
    for(const { item } of this.map.values()) {
      yield item;
    }
  }

  findById(id: string) {
    return this.map.get(id);
  }

  findByIndex(index: number) {
    return this.data[index];
  }

  // push at the end of array, or replace if id exists
  set(itemData: TData) {
    const item = new this.ModelFactory(itemData);
    const mapItem = this.map.get(item.id);

    if (mapItem) {
      // replace
      mapItem.item = item;
      this.data[mapItem.index] = itemData;
    } else {
      // push
      const index = this.data.length;
      this.data.push(itemData);
      this.map.set(item.id, { item, index });
    }

    return item;
  }

  clear(id: string) {
    const mapItem = this.map.get(id);
    if (!mapItem) {
      return false;
    }

    this.map.delete(id);
    this.data.splice(mapItem.index, 1);
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

class DefaultWindowModel {
  constructor(public readonly data: Mutable<DefaultWindow>) {
  }

  /**
   * @param windowId 
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onRenameWindow(windowId: string, newId: string) {
    let changed = false;

    for (const [key, value] of Object.entries(this.data)) {
      if (value === windowId) {
        this.data[key] = newId;
        changed = true;
      }
    }
  
    return changed;
  }

  /**
   * @param windowId 
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onClearWindow(windowId: string) {
    return this.onRenameWindow(windowId, null);
  }
}

class WindowModel {
  constructor(public readonly data: Mutable<Window>) {
  }

  get id() {
    return this.data.id;
  }

  set id(value: string) {
    this.data.id = value;
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onRenameResource(resourceId: string, newId: string) {
    let changed = false;

    if (this.data.backgroundResource === resourceId) {
      this.data.backgroundResource = newId;
      changed = true;
    }

    for (const control of this.data.controls) {
      const { display } = control;
      if (!display) {
        continue;
      }

      if (display.defaultResource === resourceId) {
        asMutable(display).defaultResource = newId;
        changed = true;
      }

      for (const item of display.map) {
        if (item.resource === resourceId) {
          asMutable(item).resource = newId;
          changed = true;
        }
      }
    }

    return changed;
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onClearResource(resourceId: string) {
    return this.onRenameResource(resourceId, null);
  }

  /**
   * @param windowId 
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onRenameWindow(windowId: string, newId: string) {
    let changed = false;

    for (const control of this.data.controls) {
      for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
        const windowAction = control[aid]?.window;

        if(windowAction?.id === windowId) {
          asMutable(windowAction).id = newId
          changed = true;
        }
      }
    }

    return changed;
  }

  /**
   * @param windowId 
   * @returns `true` if the window has been changed, `false` otherwise
   */
  onClearWindow(windowId: string) {
    return this.onRenameWindow(windowId, null);
  }
}

class ResourceModel {
  constructor(public readonly data: Mutable<DefinitionResource>) {
  }

  get id() {
    return this.data.id;
  }

  set id(value: string) {
    this.data.id = value;
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

/**
 * Workaround for readonly model
 */
function asMutable<T>(obj: T) {
  const mutableObj: Mutable<T> = obj;
  return mutableObj;
}