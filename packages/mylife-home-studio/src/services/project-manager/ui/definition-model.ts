import { components } from 'mylife-home-common';
import { UiValidationError, UiElementPath } from '../../../../shared/project-manager';
import { Window, DefinitionResource, DefaultWindow, Control, ControlDisplayMapItem, ControlDisplay } from '../../../../shared/ui-model';
import { MemberType } from '../../../../shared/component-model';
import { ComponentsModel } from './component-model';
import { clone } from '../../../utils/object-utils';

const WINDOW_TEMPLATE: Window = {
  id: null,
  style: null,
  height: 500,
  width: 500,
  backgroundResource: null,
  controls: []
};

const CONTROL_TEMPLATE: Control = {
  id: null,
  x: null,
  y: null,

  style: null,
  height: 50,
  width: 50,
  display: {
    componentId: null,
    componentState: null,
    defaultResource: null,
    map: [],
  },
  text: null,
  primaryAction: null,
  secondaryAction: null,
};

export interface ComponentUsage {
  componentId: string;
  memberName: string;
  path: UiElementPath;
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

interface WithId {
  id: string;
}

interface IdContainer {
  hasId(id: string): boolean;
}

export class CollectionModel<TData extends WithId, TModel extends WithId> implements IdContainer {
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
    const mapItem = this.map.get(id);
    return mapItem?.item;
  }

  getById(id: string) {
    const mapItem = this.map.get(id);
    if (!mapItem) {
      throw new Error(`Item with id '${id}' does not exist`);
    }

    return mapItem?.item;
  }

  // push at the end of array, or replace if id exists
  set(itemData: TData) {
    this.checkNewId(itemData.id);
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
    this.checkNewId(newId);
    const mapItem = this.map.get(id);
    if (!mapItem) {
      return false;
    }

    this.map.delete(id);
    mapItem.item.id = newId;
    this.map.set(newId, mapItem);
    return true;
  }

  private checkNewId(id: string) {
    if (this.hasId(id)) {
      throw new Error(`Id '${id}' already exists`);
    }

    if (id.includes(':')) {
      throw new Error(`Id '${id}' contains forbidden character ':'`);
    }
  }
}

export class DefaultWindowModel {
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

export class WindowModel {
  private readonly controls: CollectionModel<Control, ControlModel>;

  constructor(public readonly data: Mutable<Window>) {
    this.controls = new CollectionModel(this.data.controls, ControlModel);
  }

  get id() {
    return this.data.id;
  }

  set id(value: string) {
    this.data.id = value;
  }

  update(properties: Partial<Omit<Window, 'id' | 'controls'>>) {
    const data = pickIfDefined(properties, 'style', 'backgroundResource', 'height', 'width');
    Object.assign(this.data, data);
  }

  newControl(controlId: string, x: number, y: number) {
    const newControl = clone(CONTROL_TEMPLATE) as Mutable<Control>;
    newControl.id = controlId;
    newControl.x = x;
    newControl.y = y;

    return this.controls.set(newControl);
  }

  cloneControl(controlId: string, newId: string) {
    const source = this.controls.getById(controlId);

    const newControl = clone(source.data);
    newControl.id = newId;
    newControl.x += 10;
    newControl.y += 10;

    return this.controls.set(newControl);
  }

  clearControl(controlId: string) {
    this.controls.clear(controlId);
  }

  renameControl(id: string, newId: string) {
    return this.controls.rename(id, newId);
  }

  getControl(controlId: string) {
    return this.controls.getById(controlId);
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

    for (const controlModel of this.controls) {
      if (controlModel.onRenameResource(resourceId, newId)) {
        changed = true;
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

    for (const controlModel of this.controls) {
      if (controlModel.onRenameWindow(windowId, newId)) {
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
    context.checkResourceId(this.data.backgroundResource, () => [{ type: 'window', id: this.id }], { optional: true });

    let index = 0;
    for (const controlModel of this.controls) {
      controlModel.validate(context, this.id, index++);
    }
  }

  collectComponentsUsage(usage: ComponentUsage[]) {
    for (const controlModel of this.controls) {
      controlModel.collectComponentsUsage(usage, this.id);
    }
  }

  clearComponentUsage(usage: ComponentUsage) {
    const node = usage.path[1];
    if (node.type !== 'control') {
      return false; // paranoia
    }

    const controlModel = this.controls.findById(node.id);
    if (!controlModel) {
      return false; // paranoia
    }
    return controlModel.clearComponentUsage(usage);
  }
}

export class ControlModel {
  constructor(public readonly data: Mutable<Control>) {
  }

  get id() {
    return this.data.id;
  }

  set id(value: string) {
    this.data.id = value;
  }

  update(properties: Partial<Omit<Control, 'id'>>) {
    const data = pickIfDefined(properties, 'style', 'height', 'width', 'x', 'y', 'display', 'text', 'primaryAction', 'secondaryAction');
    Object.assign(this.data, data);
  }

 /**
  * @param resourceId
  * @param newId
  * @returns `true` if the window has been changed, `false` otherwise
  */
  onRenameResource(resourceId: string, newId: string) {
    const { display } = this.data;
    if (!display) {
      return false;
    }

    let changed = false;
    
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

    for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
      const windowAction = this.data[aid]?.window;

      if (windowAction?.id === windowId) {
        asMutable(windowAction).id = newId;
        changed = true;
      }
    }

    return changed;
  }

  validate(context: ValidationContext, windowId: string, index: number) {
    context.checkId(this.id, () => [{ type: 'window', id: windowId }, { type: 'control', id: index.toString() }]);

    if ((this.data.display && this.data.text) || (!this.data.display && !this.data.text)) {
      context.addError('Le contrôle doit être image ou texte', [{ type: 'window', id: windowId }, { type: 'control', id: this.id }]);
    } else if (this.data.display) {
      this.validateDisplay(context, windowId);
    } else if (this.data.text) {
      this.validateText(context, windowId);
    }

    this.validateAction('primaryAction', context, windowId);
    this.validateAction('secondaryAction', context, windowId);
  }

  private validateDisplay(context: ValidationContext, windowId: string) {
    const { display } = this.data;
    const pathBuilder = () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }];
    context.checkResourceId(display.defaultResource, pathBuilder, { optional: true });

    for (const [index, item] of display.map.entries()) {
      context.checkResourceId(item.resource, () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'map-item', id: index.toString() }]);
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
      const pathBuilder = () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'map-item', id: index.toString() }];

      switch (type.typeId) {
        case 'range': {
          const rangeType = type as components.metadata.Range;
          this.validateRangeValue(item, rangeType.min, rangeType.max, context, pathBuilder);
          break;
        }

        case 'text':
          this.validateTextValue(item, context, pathBuilder);
          break;

        case 'float':
          this.validateFloatValue(item, context, pathBuilder);
          break;

        case 'bool':
          this.validateEnumValue(item, [true, false], context, pathBuilder);
          break;

        case 'enum': {
          const enumType = type as components.metadata.Enum;
          this.validateEnumValue(item, enumType.values, context, pathBuilder);
          break;
        }
      }
    }
  }

  private validateTextValue(item: ControlDisplayMapItem, context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'text' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (typeof item.value !== 'string') {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateEnumValue(item: ControlDisplayMapItem, values: readonly any[], context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'enum' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (!values.includes(item.value)) {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateFloatValue(item: ControlDisplayMapItem, context: ValidationContext, pathBuilder: PathBuilder) {
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

  private validateRangeValue(item: ControlDisplayMapItem, min: number, max: number, context: ValidationContext, pathBuilder: PathBuilder) {
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

  private validateText(context: ValidationContext, windowId: string) {
    const { text } = this.data;
    for (const [index, item] of text.context.entries()) {
      context.checkId(item.id, () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'context-item', id: index.toString() }]);

      context.checkComponent(
        item.componentId,
        item.componentState,
        () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'context-item', id: item.id }],
        { memberType: MemberType.STATE }
      );
    }

    // try to build function
    const argNames = text.context.map(item => item.id).join(',');
    try {
      new Function(argNames, text.format);
    } catch (compileError) {
      context.addError('Le format est invalide', [{ type: 'window', id: windowId }, { type: 'control', id: this.id }]);
    }
  }

  private validateAction(type: 'primaryAction' | 'secondaryAction', context: ValidationContext, windowId: string) {
    const action = this.data[type];
    if (!action) {
      return;
    }

    if ((action.component && action.window) || (!action.component && !action.window)) {
      context.addError(`L'action doit être composant ou fenêtre`, [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'action', id: type }]);
      return;
    }

    if (action.component) {
      context.checkComponent(
        action.component.id,
        action.component.action,
        () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'action', id: type }],
        { memberType: MemberType.ACTION, valueType: 'bool' }
      );
    }

    if (action.window) {
      context.checkWindowId(action.window.id, () => [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'action', id: type }]);
    }
  }

  collectComponentsUsage(usage: ComponentUsage[], windowId: string) {
    const { display, text } = this.data;
    if (display) {
      if (display.componentId && display.componentState) {
        usage.push({
          componentId: display.componentId,
          memberName: display.componentState,
          path: [{ type: 'window', id: windowId }, { type: 'control', id: this.id }]
        });
      }
    }

    if (text) {
      for (const [index, item] of text.context.entries()) {
        if (item.componentId && item.componentState) {
          usage.push({
            componentId: item.componentId,
            memberName: item.componentState,
            path: [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'context-item', id: index.toString() }]
          });
        }
      }
    }

    for (const type of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
      const component = this.data[type]?.component;

      if (component) {
        if (component.id && component.action) {
          usage.push({
            componentId: component.id,
            memberName: component.action,
            path: [{ type: 'window', id: windowId }, { type: 'control', id: this.id }, { type: 'action', id: type }]
          });
        }
      }
    }
  }

  clearComponentUsage(usage: ComponentUsage) {
    const { display, text } = this.data;
    let changed = false;

    if (display && display.componentId === usage.componentId && display.componentState === usage.memberName) {
      asMutable(display).componentId = null;
      asMutable(display).componentState = null;
      changed = true;
    }

    if (text) {
      for (const item of text.context) {
        if (item.componentId === usage.componentId && item.componentState === usage.memberName) {
          asMutable(item).componentId = null;
          asMutable(item).componentState = null;
          changed = true;
        }
      }
    }

    for (const type of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
      const component = this.data[type]?.component;

      if (component && component.id === usage.componentId && component.action === usage.memberName) {
        asMutable(component).id = null;
        asMutable(component).action = null;
        changed = true;
      }
    }

    return changed;
  }
}

export class ResourceModel {
  constructor(public readonly data: Mutable<DefinitionResource>) {
  }

  get id() {
    return this.data.id;
  }

  set id(value: string) {
    this.data.id = value;
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

export class ValidationContext {
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

export function newWindow(windows: CollectionModel<Mutable<Window>, WindowModel>, id: string) {
  const newWindow = clone(WINDOW_TEMPLATE) as Mutable<Window>;
  newWindow.id = id;

  return windows.set(newWindow);
}

function pickIfDefined<T>(obj: Partial<T>, ...props: (keyof T)[]): Partial<T> {
  const dest: Partial<T> = {};

  for (const prop of props) {
    if (prop in obj) {
      dest[prop] = obj[prop];
    }
  }

  return dest;
}
