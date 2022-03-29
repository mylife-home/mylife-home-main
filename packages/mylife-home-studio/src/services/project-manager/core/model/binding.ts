import { logger } from 'mylife-home-common';
import { CoreBindingData } from '../../../../../shared/project-manager';
import { ComponentModel } from './component';
import { TemplateModel } from './template';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

// Note: bindings have no update, then can only be created or deleted
export class BindingModel {
  private _id: string;
  private _template: TemplateModel; // null if on project directly

  constructor(template: TemplateModel, public readonly data: CoreBindingData, public readonly sourceComponent: ComponentModel, public readonly targetComponent: ComponentModel) {
    this._template = template;
    this.rebuild();
  }

  static makeId(data: CoreBindingData) {
    return `${data.sourceComponent}:${data.sourceState}:${data.targetComponent}:${data.targetAction}`;
  }

  rebuild() {
    this.data.sourceComponent = this.sourceComponent.id;
    this.data.targetComponent = this.targetComponent.id;
    this._id = BindingModel.makeId(this.data);
  }

  get id() {
    return this._id;
  }

  get template() {
    return this._template;
  }

  get sourceState() {
    return this.data.sourceState;
  }

  get targetAction() {
    return this.data.targetAction;
  }

}
