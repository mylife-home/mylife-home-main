import { components } from 'mylife-home-common';
import { UiValidationError, UiElementPath, UiWindowData, UiControlData, UiResourceData, UiStyleData, UiTemplateData, UiViewData, UiProject, UiTemplateInstanceData, UiControlDisplayData, UiControlDisplayMapItemData, UiControlTextData, UiTemplateInstanceBinding } from '../../../../shared/project-manager';
import { DefaultWindow, Style } from '../../../../shared/ui-model';
import { MemberType } from '../../../../shared/component-model';
import { ComponentsModel } from './component-model';
import { clone } from '../../../utils/object-utils';

// Note: same than templates on client

const WINDOW_TEMPLATE: UiWindowData = {
  style: [],
  height: 500,
  width: 500,
  backgroundResource: null,
  controls: {},
  templates: {}
};

const TEMPLATE_TEMPLATE: UiTemplateData = {
  height: 500,
  width: 500,
  exports: {},
  controls: {},
  templates: {}
};

const TEMPLATE_INSTANCE_TEMPLATE: UiTemplateInstanceData = {
  templateId: null,
  x: null,
  y: null,
  bindings: {}
};

const CONTROL_TEMPLATE: UiControlData = {
  x: null,
  y: null,

  style: [],
  height: 50,
  width: 50,
  display: null,
  text: null,
  primaryAction: null,
  secondaryAction: null,
};

const CONTROL_DISPLAY_TEMPLATE: UiControlDisplayData = {
  componentId: null,
  componentState: null,
  defaultResource: null,
  map: [],
};

const CONTROL_TEXT_TEMPLATE: UiControlTextData = {
  context: [],
  format: `return '';`,
};

export interface ComponentUsage {
  componentId: string;
  memberName: string;
  path: UiElementPath;
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

class ModelBase {
  private _id: string;

  constructor(public readonly project: ProjectModel, id: string) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }
}

interface IdContainer {
  hasId(id: string): boolean;
}

export class CollectionModel<TData, TModel extends ModelBase> implements IdContainer {
  private readonly map = new Map<string, TModel>();

  constructor(public readonly project: ProjectModel, public readonly data: { [id: string]: TData; }, private readonly ModelFactory: new (project: ProjectModel, id: string, data: TData) => TModel) {
    for (const [id, itemData] of Object.entries(data)) {
      const item = new this.ModelFactory(this.project, id, itemData);
      this.map.set(item.id, item);
    }
  }

  *[Symbol.iterator]() {
    for (const item of this.map.values()) {
      yield item;
    }
  }

  hasId(id: string) {
    return this.map.has(id);
  }

  findById(id: string) {
    return this.map.get(id);
  }

  getById(id: string) {
    const item = this.map.get(id);
    if (!item) {
      throw new Error(`Item with id '${id}' does not exist`);
    }

    return item;
  }

  set(id: string, itemData: TData) {
    this.checkNewId(id);
    const item = new this.ModelFactory(this.project, id, itemData);

    // replace or insert
    this.data[item.id] = itemData;
    this.map.set(item.id, item);

    return item;
  }

  clear(id: string) {
    const item = this.map.get(id);
    if (!item) {
      return false;
    }

    this.map.delete(id);
    delete this.data[id];
    return true;
  }

  rename(id: string, newId: string) {
    this.checkNewId(newId);
    const item = this.map.get(id);
    if (!item) {
      return false;
    }

    item.rename(newId);
    this.map.delete(id);
    this.map.set(newId, item);

    const data = this.data[id];
    delete this.data[id];
    this.data[newId] = data;

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

export class ProjectModel {
  readonly defaultWindow: DefaultWindowModel;
  private readonly windows: CollectionModel<UiWindowData, WindowModel>;
  private readonly templates: CollectionModel<UiTemplateData, TemplateModel>;
  private readonly resources: CollectionModel<UiResourceData, ResourceModel>;
  private readonly styles: CollectionModel<UiStyleData, StyleModel>;
  readonly components: ComponentsModel;

  constructor(data: UiProject) {
    this.defaultWindow = new DefaultWindowModel(data.defaultWindow);
    this.windows = new CollectionModel(this, data.windows, WindowModel);
    this.templates = new CollectionModel(this, data.templates, TemplateModel);
    this.resources = new CollectionModel(this, data.resources, ResourceModel);
    this.styles = new CollectionModel(this, data.styles, StyleModel);
    this.components = new ComponentsModel({ components: data.components, plugins: data.plugins });
  }

  setDefaultWindow(newDefaultWindow: DefaultWindow) {
    this.defaultWindow.set(newDefaultWindow);
  }

  setResource(id: string, resource: UiResourceData) {
    const existing = this.resources.findById(id);
    if (existing) {
      existing.update(resource);
      return existing;
    } else {
      return this.resources.set(id, resource);
    }
  }

  clearResource(id: string) {
    this.resources.clear(id);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onClearResource(id)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onClearResource(id)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  renameResource(id: string, newId: string) {
    this.resources.rename(id, newId);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onRenameResource(id, newId)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onRenameResource(id, newId)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  setStyle(id: string, style: UiStyleData) {
    const existing = this.styles.findById(id);
    if (existing) {
      existing.update(style);
      return existing;
    } else {
      return this.styles.set(id, style);
    }
  }

  clearStyle(id: string) {
    this.styles.clear(id);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onClearStyle(id)) {
        impacts.windows.push(window);
      }
    }

    return impacts;
  }

  renameStyle(id: string, newId: string) {
    this.styles.rename(id, newId);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onRenameStyle(id, newId)) {
        impacts.windows.push(window);
      }
    }

    return impacts;
  }

  newWindow(id: string) {
    const newWindow = clone(WINDOW_TEMPLATE) as UiWindowData;
    return this.windows.set(id, newWindow);
  }

  cloneWindow(id: string, newId: string) {
    const source = this.windows.getById(id);
    const newWindow = clone(source.data);
    return this.windows.set(newId, newWindow);
  }

  clearWindow(id: string) {
    this.windows.clear(id);

    const impacts = {
      defaultWindow: false,
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    if (this.defaultWindow.onClearWindow(id)) {
      impacts.defaultWindow = true;
    }

    for (const window of this.windows) {
      if (window.onClearWindow(id)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onClearWindow(id)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  renameWindow(id: string, newId: string) {
    this.windows.rename(id, newId);

    const impacts = {
      defaultWindow: false,
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    if (this.defaultWindow.onRenameWindow(id, newId)) {
      impacts.defaultWindow = true;
    }

    for (const window of this.windows) {
      if (window.onRenameWindow(id, newId)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onRenameWindow(id, newId)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  getWindow(id: string) {
    return this.windows.getById(id);
  }

  newTemplate(id: string) {
    const newTemplate = clone(TEMPLATE_TEMPLATE) as UiTemplateData;
    return this.templates.set(id, newTemplate);
  }

  cloneTemplate(id: string, newId: string) {
    const source = this.templates.getById(id);
    const newTemplate = clone(source.data);
    return this.templates.set(newId, newTemplate);
  }

  clearTemplate(id: string) {
    this.templates.clear(id);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onClearTemplate(id)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onClearTemplate(id)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  renameTemplate(id: string, newId: string) {
    this.templates.rename(id, newId);

    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const window of this.windows) {
      if (window.onRenameTemplate(id, newId)) {
        impacts.windows.push(window);
      }
    }

    for (const template of this.templates) {
      if (template.onRenameTemplate(id, newId)) {
        impacts.templates.push(template);
      }
    }

    return impacts;
  }

  getTemplate(id: string) {
    return this.templates.getById(id);
  }

  getView(type: 'window' | 'template', id: string): ViewModel {
    switch (type) {
      case 'window':
        return this.getWindow(id);
      case 'template':
        return this.getTemplate(id);
    }
  }

  validate() {
    const context = new ValidationContext(this.windows, this.resources, this.components);

    this.defaultWindow.validate(context);
    for (const window of this.windows) {
      window.validate(context);
    }

    for (const template of this.templates) {
      template.validate(context);
    }

    return context.errors;
  }

  collectComponentsUsage() {
    const usage: ComponentUsage[] = [];

    for (const window of this.windows) {
      window.collectComponentsUsage(usage);
    }

    for (const template of this.templates) {
      template.collectComponentsUsage(usage);
    }

    return usage;
  }

  clearComponentsUsage(usage: ComponentUsage[]) {
    const impacts = {
      windows: [] as WindowModel[],
      templates: [] as TemplateModel[],
    };

    for (const item of usage) {
      const node = item.path[0];

      switch (node.type) {
        case 'window': {
          const window = this.getWindow(node.id);
          const changed = window.clearComponentUsage(item);
          if (changed) {
            impacts.windows.push(window);
          }

          break;
        }

        case 'template': {
          const template = this.getTemplate(node.id);
          const changed = template.clearComponentUsage(item);
          if (changed) {
            impacts.templates.push(template);
          }

          break;
        }

        // TODO: template bindings
      }
    }

    return impacts;
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

export abstract class ViewModel extends ModelBase {
  private readonly controls: CollectionModel<UiControlData, ControlModel>;
  private readonly templates: CollectionModel<UiTemplateInstanceData, TemplateInstanceModel>;
  abstract readonly data: UiViewData;
  abstract readonly viewType: 'window' | 'template';

  constructor(project: ProjectModel, id: string, data: UiViewData) {
    super(project, id);
    const owner = this;

    class BoundControlModel extends ControlModel {
      constructor(project: ProjectModel, id: string, data: UiControlData) {
        super(owner, project, id, data);
      }
    }

    this.controls = new CollectionModel(this.project, data.controls, BoundControlModel);
    this.templates = new CollectionModel(this.project, data.templates, TemplateInstanceModel);
  }

  newControl(controlId: string, type: 'display' | 'text', x: number, y: number) {
    const newControl = clone(CONTROL_TEMPLATE);
    newControl.x = x;
    newControl.y = y;

    switch (type) {
      case 'display':
        newControl.display = clone(CONTROL_DISPLAY_TEMPLATE);
        break;

      case 'text':
        newControl.text = clone(CONTROL_TEXT_TEMPLATE);
        break;
    }

    return this.controls.set(controlId, newControl);
  }

  cloneControl(sourceControl: ControlModel, newId: string) {
    const newControl = clone(sourceControl.data);

    if (sourceControl.owner === this) {
      newControl.x += 10;
      newControl.y += 10;
    } else {
      newControl.x = 10;
      newControl.y = 10;
    }

    return this.controls.set(newId, newControl);
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

  newTemplateInstance(templateInstanceId: string, templateId: string, x: number, y: number) {
    const template = this.project.getTemplate(templateId);
    const newTemplateInstance = clone(TEMPLATE_INSTANCE_TEMPLATE) as UiTemplateInstanceData;
    newTemplateInstance.x = x;
    newTemplateInstance.y = y;

    const model = this.templates.set(templateInstanceId, newTemplateInstance);
    model.setTemplate(template);
  }

  cloneTemplateInstance(templateInstanceId: string, newId: string) {
    const source = this.templates.getById(templateInstanceId);

    const newTemplateInstance = clone(source.data);
    newTemplateInstance.x += 10;
    newTemplateInstance.y += 10;

    return this.templates.set(newId, newTemplateInstance);
  }

  clearTemplateInstance(templateInstanceId: string) {
    this.templates.clear(templateInstanceId);
  }

  renameTemplateInstance(id: string, newId: string) {
    return this.templates.rename(id, newId);
  }

  getTemplateInstance(templateInstanceId: string) {
    return this.templates.getById(templateInstanceId);
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onRenameResource(resourceId: string, newId: string) {
    let changed = false;

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
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearResource(resourceId: string) {
    return this.onRenameResource(resourceId, null);
  }

  /**
   * @param styleId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onRenameStyle(styleId: string, newId: string) {
    let changed = false;

    for (const controlModel of this.controls) {
      if (styleRename(controlModel.data.style, styleId, newId)) {
        changed = true;
      }
    }

    return changed;
  }

  /**
   * @param styleId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearStyle(styleId: string) {
    let changed = false;

    for (const controlModel of this.controls) {
      if (styleClear(controlModel.data.style, styleId)) {
        changed = true;
      }
    }

    return changed;
  }

  /**
   * @param windowId 
   * @returns `true` if the view has been changed, `false` otherwise
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
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearWindow(windowId: string) {
    return this.onRenameWindow(windowId, null);
  }

  /**
   * @param templateId 
   * @param newId 
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onRenameTemplate(templateId: string, newId: string) {
    let changed = false;

    for (const templateInstanceModel of this.templates) {
      if (templateInstanceModel.onRenameTemplate(templateId, newId)) {
        changed = true;
      }
    }

    return changed;
  }

  /**
   * @param templateId 
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearTemplate(templateId: string) {
    let changed = false;

    for (const templateInstanceModel of this.templates) {
      if (templateInstanceModel.data.templateId === templateId) {
        this.clearTemplateInstance(templateInstanceModel.id);
        changed = true;
      }
    }

    return changed;
  }

  validate(context: ValidationContext) {
    let index = 0;
    for (const controlModel of this.controls) {
      controlModel.validate(context, this.viewType, this.id, index++);
    }

    index = 0;
    for (const templateInstanceModel of this.templates) {
      templateInstanceModel.validate(context, this.viewType, this.id, index++);
    }
  }

  collectComponentsUsage(usage: ComponentUsage[]) {
    for (const controlModel of this.controls) {
      controlModel.collectComponentsUsage(usage, this.viewType, this.id);
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

export class WindowModel extends ViewModel {
  constructor(project: ProjectModel, id: string, public readonly data: UiWindowData) {
    super(project, id, data);
  }

  get viewType(): 'window' {
    return 'window';
  }

  update(properties: Partial<Omit<UiWindowData, 'controls'>>) {
    const data = pickIfDefined(properties, 'style', 'backgroundResource', 'height', 'width');

    if (data.style) {
      data.style.sort();
    }

    Object.assign(this.data, data);
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onRenameResource(resourceId: string, newId: string) {
    let changed = false;

    if (this.data.backgroundResource === resourceId) {
      this.data.backgroundResource = newId;
      changed = true;
    }

    if (super.onRenameResource(resourceId, newId)) {
      changed = true;
    }

    return changed;
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearResource(resourceId: string) {
    return this.onRenameResource(resourceId, null);
  }

  /**
   * @param styleId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onRenameStyle(styleId: string, newId: string) {
    let changed = false;

    if (styleRename(this.data.style, styleId, newId)) {
      changed = true;
    }

    if (super.onRenameStyle(styleId, newId)) {
      changed = true;
    }

    return changed;
  }

  /**
   * @param styleId
   * @param newId
   * @returns `true` if the view has been changed, `false` otherwise
   */
  onClearStyle(styleId: string) {
    let changed = false;

    if (styleClear(this.data.style, styleId)) {
      changed = true;
    }

    if (super.onClearStyle(styleId)) {
      changed = true;
    }

    return changed;
  }

  validate(context: ValidationContext) {
    context.checkResourceId(this.data.backgroundResource, () => [{ type: 'window', id: this.id }], { optional: true });
    super.validate(context);
  }
}

export class TemplateModel extends ViewModel {
  constructor(project: ProjectModel, id: string, public readonly data: UiTemplateData) {
    super(project, id, data);
  }

  get viewType(): 'template' {
    return 'template';
  }

  update(properties: Partial<Omit<UiTemplateData, 'controls'>>) {
    const data = pickIfDefined(properties, 'height', 'width');

    Object.assign(this.data, data);
  }

  setExport(exportId: string, memberType: MemberType, valueType: string) {
    // TODO: usage checks
    this.data.exports[exportId] = { memberType, valueType };
  }

  clearExport(exportId: string) {
    // TODO: usage checks
    delete this.data.exports[exportId];
  }

  prepareBindings() {
    const bindings: { [name: string]: UiTemplateInstanceBinding; } = {};

    for (const exportId of Object.keys(this.data.exports)) {
      bindings[exportId] = { componentId: null, memberName: null };
    }

    return bindings;
  }

  getExportData(exportId: string) {
    const exportData = this.data.exports[exportId];
    if (!exportData) {
      throw new Error(`Export '${exportId}' does not exist on template '${this.id}'`);
    }

    return exportData;
  }
}

export class TemplateInstanceModel extends ModelBase {
  constructor(project: ProjectModel, id: string, public readonly data: UiTemplateInstanceData) {
    super(project, id);
  }

  get template() {
    if (this.data.templateId) {
      return this.project.getTemplate(this.data.templateId);
    } else {
      return null;
    }
  }

  move(x: number, y: number) {
    if (x != null) {
      this.data.x = x;
    }

    if (y != null) {
      this.data.y = y;
    }
  }

  setTemplate(template: TemplateModel) {
    this.data.templateId = template.id;

    // reset bindings
    this.data.bindings = template.prepareBindings();
  }

  setBinding(exportId: string, componentId: string, memberName: string) {
    const binding = this.data.bindings[exportId];
    if (!binding) {
      throw new Error(`Binding from export '${exportId}' not found on template '${this.template.id}'`);
    }

    const exportData = this.template.getExportData(exportId);
    const valueType = this.project.components.findComponentMemberValueType(componentId, memberName, exportData.memberType);
    if (!valueType || exportData.valueType !== valueType) {
      throw new Error(`Binding mismatch: cannot bind '${componentId}.${memberName}' on export '${exportId}'`);
    }

    binding.componentId = componentId;
    binding.memberName = memberName;
  }

  /**
   * @param templateId
   * @param newId
   * @returns `true` if the template instance has been changed, `false` otherwise
   */
  onRenameTemplate(templateId: string, newId: string) {
    let changed = false;

    if (this.data.templateId === templateId) {
      this.data.templateId = newId;
      changed = true;
    }

    return changed;
  }

  validate(context: ValidationContext, viewType: 'window' | 'template', viewId: string, index: number) {
    context.checkId(this.id, () => [{ type: viewType, id: viewId }, { type: 'template-instance', id: index.toString() }]);

    if (!this.data.templateId) {
      context.addError('Template non défini', [{ type: viewType, id: viewId }, { type: 'template-instance', id: this.id }]);
    }
  }
}

export class ControlModel extends ModelBase {
  constructor(public readonly owner: ViewModel, project: ProjectModel, id: string, public readonly data: UiControlData) {
    super(project, id);
  }

  update(properties: Partial<UiControlData>) {
    const data = pickIfDefined(properties, 'style', 'height', 'width', 'x', 'y', 'display', 'text', 'primaryAction', 'secondaryAction');

    if (data.style) {
      data.style.sort();
    }

    Object.assign(this.data, data);
  }

  /**
   * @param resourceId
   * @param newId
   * @returns `true` if the control has been changed, `false` otherwise
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
    * @returns `true` if the control has been changed, `false` otherwise
    */
  onClearResource(resourceId: string) {
    return this.onRenameResource(resourceId, null);
  }

  /**
    * @param windowId 
    * @returns `true` if the control has been changed, `false` otherwise
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

  validate(context: ValidationContext, viewType: 'window' | 'template', viewId: string, index: number) {
    context.checkId(this.id, () => [{ type: viewType, id: viewId }, { type: 'control', id: index.toString() }]);

    if ((this.data.display && this.data.text) || (!this.data.display && !this.data.text)) {
      context.addError('Le contrôle doit être image ou texte', [{ type: viewType, id: viewId }, { type: 'control', id: this.id }]);
    } else if (this.data.display) {
      this.validateDisplay(context, viewType, viewId);
    } else if (this.data.text) {
      this.validateText(context, viewType, viewId);
    }

    this.validateAction('primaryAction', context, viewType, viewId);
    this.validateAction('secondaryAction', context, viewType, viewId);
  }

  private validateDisplay(context: ValidationContext, viewType: 'window' | 'template', viewId: string) {
    const { display } = this.data;
    const pathBuilder = () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }];
    context.checkResourceId(display.defaultResource, pathBuilder, { optional: true });

    for (const [index, item] of display.map.entries()) {
      context.checkResourceId(item.resource, () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'map-item', id: index.toString() }]);
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
      const pathBuilder = () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'map-item', id: index.toString() }];

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

  private validateTextValue(item: UiControlDisplayMapItemData, context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'text' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (typeof item.value !== 'string') {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateEnumValue(item: UiControlDisplayMapItemData, values: readonly any[], context: ValidationContext, pathBuilder: PathBuilder) {
    if (item.min !== null || item.max !== null) {
      context.addError(`Le type 'enum' ne doit pas utiliser min/max`, pathBuilder());
    }

    if (!values.includes(item.value)) {
      context.addError('Valeur incorrecte', pathBuilder());
    }
  }

  private validateFloatValue(item: UiControlDisplayMapItemData, context: ValidationContext, pathBuilder: PathBuilder) {
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

  private validateRangeValue(item: UiControlDisplayMapItemData, min: number, max: number, context: ValidationContext, pathBuilder: PathBuilder) {
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

  private validateText(context: ValidationContext, viewType: 'window' | 'template', viewId: string) {
    const { text } = this.data;
    for (const [index, item] of text.context.entries()) {
      context.checkId(item.id, () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'context-item', id: index.toString() }]);

      context.checkComponent(
        item.componentId,
        item.componentState,
        () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'context-item', id: item.id }],
        { memberType: MemberType.STATE }
      );
    }

    // try to build function
    const argNames = text.context.map(item => item.id).join(',');
    try {
      new Function(argNames, text.format);
    } catch (compileError) {
      context.addError('Le format est invalide', [{ type: viewType, id: viewId }, { type: 'control', id: this.id }]);
    }
  }

  private validateAction(type: 'primaryAction' | 'secondaryAction', context: ValidationContext, viewType: 'window' | 'template', viewId: string) {
    const action = this.data[type];
    if (!action) {
      return;
    }

    if ((action.component && action.window) || (!action.component && !action.window)) {
      context.addError(`L'action doit être composant ou fenêtre`, [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'action', id: type }]);
      return;
    }

    if (action.component) {
      context.checkComponent(
        action.component.id,
        action.component.action,
        () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'action', id: type }],
        { memberType: MemberType.ACTION, valueType: 'bool' }
      );
    }

    if (action.window) {
      context.checkWindowId(action.window.id, () => [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'action', id: type }]);
    }
  }

  collectComponentsUsage(usage: ComponentUsage[], viewType: 'window' | 'template', viewId: string) {
    const { display, text } = this.data;
    if (display) {
      if (display.componentId && display.componentState) {
        usage.push({
          componentId: display.componentId,
          memberName: display.componentState,
          path: [{ type: viewType, id: viewId }, { type: 'control', id: this.id }]
        });
      }
    }

    if (text) {
      for (const [index, item] of text.context.entries()) {
        if (item.componentId && item.componentState) {
          usage.push({
            componentId: item.componentId,
            memberName: item.componentState,
            path: [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'context-item', id: index.toString() }]
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
            path: [{ type: viewType, id: viewId }, { type: 'control', id: this.id }, { type: 'action', id: type }]
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

export class ResourceModel extends ModelBase {
  constructor(project: ProjectModel, id: string, public readonly data: UiResourceData) {
    super(project, id);
  }

  update(resource: UiResourceData) {
    const { mime, data } = resource;
    Object.assign(this.data, { mime, data });
  }
}

export class StyleModel extends ModelBase {
  constructor(project: ProjectModel, id: string, public readonly data: UiStyleData) {
    super(project, id);
  }

  update(style: UiStyleData) {
    const { properties } = style;
    Object.assign(this.data, { properties });
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

function pickIfDefined<T>(obj: Partial<T>, ...props: (keyof T)[]): Partial<T> {
  const dest: Partial<T> = {};

  for (const prop of props) {
    if (prop in obj) {
      dest[prop] = obj[prop];
    }
  }

  return dest;
}

function styleRename(style: Style, styleId: string, newId: string) {
  const index = style.indexOf(styleId);
  if (index === -1) {
    return false;
  }

  style.splice(index, 1, newId);
  style.sort();

  return true;
}

function styleClear(style: Style, styleId: string) {
  const index = style.indexOf(styleId);
  if (index === -1) {
    return false;
  }

  style.splice(index, 1);
  return true;
}