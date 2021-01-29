import { components } from 'mylife-home-common';
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
  UiValidationError,
  UiElementPath,
} from '../../../../shared/project-manager';
import { Window, DefinitionResource, DefaultWindow, Control, ControlDisplayMapItem } from '../../../../shared/ui-model';
import { Component, MemberType } from '../../../../shared/component-model';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { UiProjects } from './projects';

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

  private async refreshComponents() {
    // TODO
    this.components.rebuild();
  }
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

interface WithId {
  id: string;
}

interface IdContainer {
  hasId(id: string): boolean;
}

class CollectionModel<TData extends WithId, TModel extends WithId> implements IdContainer {
  private readonly map = new Map<string, { item: TModel, index: number; }>();

  constructor(public readonly data: TData[], private readonly ModelFactory: new (data: TData) => TModel) {
    for (const [index, itemData] of data.entries()) {
      const item = new this.ModelFactory(itemData);
      this.map.set(item.id, { item, index });
    }
  }

  *[Symbol.iterator]() {
    for (const { item } of this.map.values()) {
      yield item;
    }
  }

  hasId(id: string) {
    return this.map.has(id);
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

  set(newDefaultWindow: DefaultWindow) {
    Object.assign(this.data, newDefaultWindow);
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

  validate(context: ValidationContext) {
    for (const [key, value] of Object.entries(this.data)) {
      context.checkWindowId(value, () => [{ type: 'defaultWindow', id: key }]);
    }
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

        if (windowAction?.id === windowId) {
          asMutable(windowAction).id = newId;
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

  validate(context: ValidationContext) {
    context.checkResourceId(this.data.backgroundResource, () => [{ type: 'window', id: this.id }], { optional: true });

    for (const [index, control] of this.data.controls.entries()) {
      context.checkId(control.id, () => [{ type: 'window', id: this.id }, { type: 'control', id: index.toString() }]);

      if ((control.display && control.text) || (!control.display && !control.text)) {
        context.addError('Le contrôle doit être image ou texte', [{ type: 'window', id: this.id }, { type: 'control', id: control.id }]);
      } else if (control.display) {
        this.validateControlDisplay(control, context);
      } else if (control.text) {
        this.validateControlText(control, context);
      }

      this.validateControlAction(control, 'primaryAction', context);
      this.validateControlAction(control, 'secondaryAction', context);
    }
  }

  private validateControlDisplay(control: Control, context: ValidationContext) {
    const { display } = control;
    const pathBuilder = () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }];
    context.checkResourceId(display.defaultResource, pathBuilder, { optional: true });

    for (const [index, item] of display.map.entries()) {
      context.checkResourceId(item.resource, () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'map-item', id: index.toString() }]);
    }

    const valueType = context.checkComponent(display.componentId, display.componentState, pathBuilder, { memberType: MemberType.STATE, optional: display.map.length === 0 });
    if (!valueType) {
      return;
    }

    const type = components.metadata.parseType(valueType);
    if (type.typeId === 'complex') {
      context.addError('Un composant de type complexe ne peut pas être utilisé', pathBuilder());
      return;
    }

    for (const [index, item] of display.map.entries()) {
      const pathBuilder = () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'map-item', id: index.toString() }];

      switch (type.typeId) {
        case 'range': {
          const rangeType = type as components.metadata.Range;
          this.validateRange(item, rangeType.min, rangeType.max, context, pathBuilder);
          break;
        }

        case 'text':
          this.validateText(item, context, pathBuilder);
          break;

        case 'float':
          this.validateFloat(item, context, pathBuilder);
          break;

        case 'bool':
          this.validateEnum(item, [true, false], context, pathBuilder);
          break;

        case 'enum': {
          const enumType = type as components.metadata.Enum;
          this.validateEnum(item, enumType.values, context, pathBuilder);
          break;
        }
      }
    }
  }

  private validateText(item: ControlDisplayMapItem, context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'text' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (typeof item.value !== 'string') {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateEnum(item: ControlDisplayMapItem, values: readonly any[], context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'enum' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (!values.includes(item.value)) {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateFloat(item: ControlDisplayMapItem, context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.value !== null) {
      context.addError(`Le type 'float' ne doit pas utiliser valeur mais min/max`, pathBuilder());
    }

    if (typeof item.min !== 'number' && item.min !== null) {
      context.addError(`'min' incorrect`, pathBuilder());
    }

    if (typeof item.max !== 'number' && item.max !== null) {
      context.addError(`'max' incorrect`, pathBuilder());
    }

    if (typeof item.min === 'number' && typeof item.max === 'number' && item.min > item.max) {
      context.addError(`'min' > 'max'`, pathBuilder());
    }
  }

  private validateRange(item: ControlDisplayMapItem, min: number, max: number, context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.value !== null) {
      context.addError(`Le type 'range' ne doit pas utiliser valeur mais min/max`, pathBuilder());
    }

    if (typeof item.min !== 'number' || item.min % 1 !== 0 || item.min < min) {
      context.addError(`'min' incorrect`, pathBuilder());
    }

    if (typeof item.max !== 'number' || item.max % 1 !== 0 || item.max > max) {
      context.addError(`'max' incorrect`, pathBuilder());
    }

    if (item.min > item.max) {
      context.addError(`'min' > 'max'`, pathBuilder());
    }
  }

  private validateControlText(control: Control, context: ValidationContext) {
    const { text } = control;
    for (const [index, item] of text.context.entries()) {
      context.checkId(item.id, () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'context-item', id: index.toString() }]);

      context.checkComponent(
        item.componentId,
        item.componentState,
        () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'context-item', id: item.id }],
        { memberType: MemberType.STATE }
      );
    }

    // try to build function
    const argNames = text.context.map(item => item.id).join(',');
    try {
      new Function(argNames, text.format);
    } catch (compileError) {
      context.addError('Le format est invalide', [{ type: 'window', id: this.id }, { type: 'control', id: control.id }]);
    }
  }

  private validateControlAction(control: Control, type: 'primaryAction' | 'secondaryAction', context: ValidationContext) {
    const action = control[type];
    if (!action) {
      return;
    }

    if ((action.component && action.window) || (!action.component && !action.window)) {
      context.addError(`L'action doit être composant ou fenêtre`, [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'action', id: type }]);
      return;
    }

    if (action.component) {
      context.checkComponent(
        action.component.id,
        action.component.action,
        () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'action', id: type }],
        { memberType: MemberType.ACTION, valueType: 'bool' }
      );
    }

    if (action.window) {
      context.checkWindowId(action.window.id, () => [{ type: 'window', id: this.id }, { type: 'control', id: control.id }, { type: 'action', id: type }]);
    }
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

class ComponentsModel {
  private readonly map = new Map<string, ComponentModel>();

  constructor(readonly componentData: ComponentData) {
    this.rebuild();
  }

  rebuild() {
    this.map.clear();

    for (const component of this.componentData.components) {
      const plugin = this.componentData.plugins[component.plugin];
      const item = new ComponentModel(component, plugin);
      this.map.set(item.id, item);
    }
  }

  has(componentId: string) {
    return this.map.has(componentId);
  }

  findComponentMemberValueType(componentId: string, memberName: string, memberType: MemberType) {
    const component = this.map.get(componentId);
    return component?.findMemberValueType(memberName, memberType);
  }
}

class ComponentModel {
  constructor(private readonly component: Component, private readonly plugin: PluginData) {
  }

  get id() {
    return this.component.id;
  }

  findMemberValueType(memberName: string, memberType: MemberType) {
    const member = this.plugin.members[memberName];
    if (!member || member.memberType !== memberType) {
      return;
    }

    return member.valueType;
  }
}

/**
 * Workaround for readonly model
 */
function asMutable<T>(obj: T) {
  const mutableObj: Mutable<T> = obj;
  return mutableObj;
}

type PathBuilder = () => UiElementPath;

class ValidationContext {
  readonly errors: UiValidationError[] = [];

  constructor(readonly windowsIds: IdContainer, readonly resourcesIds: IdContainer, readonly components: ComponentsModel) {
  }

  addError(message: string, path: UiElementPath) {
    this.errors.push({ path, message });
  }

  checkId(value: string, pathBuilder: PathBuilder) {
    if (!value) {
      this.addError(`L'identifiant n'est pas défini.`, pathBuilder());
    }
  }

  checkWindowId(value: string, pathBuilder: PathBuilder) {
    if (value === null) {
      this.addError(`La fenêtre n'est pas définie.`, pathBuilder());
    } else if (!this.windowsIds.hasId(value)) {
      this.addError(`La fenêtre '${value}' n'existe pas.`, pathBuilder());
    }
  }

  checkResourceId(value: string, pathBuilder: PathBuilder, { optional = false } = {}) {
    if (value === null) {
      if (!optional) {
        this.addError(`La ressource n'est pas définie.`, pathBuilder());
      }
    } else if (!this.resourcesIds.hasId(value)) {
      this.addError(`La ressource '${value}' n'existe pas.`, pathBuilder());
    }
  }

  checkComponent(componentId: string, memberName: string, pathBuilder: PathBuilder, { memberType, valueType = null, optional = false }: { memberType: MemberType, valueType?: string | string[]; optional?: boolean; }) {
    if (!componentId) {
      if (!optional) {
        this.addError(`Le composant n'est pas défini.`, pathBuilder());
      }
      return null;
    }

    if (!this.components.has(componentId)) {
      this.addError(`Le composant '${componentId}' n'existe pas.`, pathBuilder());
      return null;
    }

    const buildErrorPrefix = () => {
      switch (memberType) {
        case MemberType.STATE:
          return `L'état '${memberName}' du composant '${componentId}'`;

        case MemberType.ACTION:
          return `L'action '${memberName}' du composant '${componentId}'`;
      }
    };

    const actualValueType = this.components.findComponentMemberValueType(componentId, memberName, memberType);
    if (!actualValueType) {
      this.addError(`${buildErrorPrefix()} n'existe pas.`, pathBuilder());
      return null;
    }

    let permittedValueTypes: Set<string>;
    if (typeof valueType === 'string') {
      permittedValueTypes = new Set([valueType]);
    } else if (Array.isArray(valueType)) {
      permittedValueTypes = new Set(valueType);
    }

    if (permittedValueTypes && !permittedValueTypes.has(actualValueType)) {
      this.addError(`${buildErrorPrefix()} a un type incorrect : '${valueType}'.`, pathBuilder());
    }

    return actualValueType;
  }
}
