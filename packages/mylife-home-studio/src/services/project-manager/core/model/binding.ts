import { logger } from 'mylife-home-common';
import { CoreBindingData } from '../../../../../shared/project-manager';
import { ComponentModel, TemplateModel } from '.';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

// Note: bindings have no update, then can only be created or deleted
export class BindingModel {
  private _id: string;

  // ownerTemplate: null if on project directly
  constructor(public readonly ownerTemplate: TemplateModel, public readonly data: CoreBindingData, public readonly sourceComponent: ComponentModel, public readonly targetComponent: ComponentModel) {
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

  get sourceState() {
    return this.data.sourceState;
  }

  get targetAction() {
    return this.data.targetAction;
  }

}
