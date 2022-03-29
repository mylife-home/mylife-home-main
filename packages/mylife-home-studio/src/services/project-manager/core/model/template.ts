import { logger } from 'mylife-home-common';
import { CoreTemplate } from '../../../../../shared/project-manager';
import { ComponentModel } from './component';
import { ViewModel } from './view';
import { ProjectModel } from './project';

const log = logger.createLogger('mylife:home:studio:services:project-manager:core:model');

export class TemplateModel extends ViewModel {
  private readonly usage = new Map<string, ComponentModel>();

  constructor(protected readonly project: ProjectModel, private _id: string, public readonly data: CoreTemplate) {
    super();
    this.init();
  }

  get id() {
    return this._id;
  }

  rename(newId: string) {
    this._id = newId;
  }

  setExport(exportType: 'config' | 'member', exportId: string, componentId: string, propertyName: string) {
    switch (exportType) {

    case 'config': 
      this.setConfigExport(exportId, componentId, propertyName);
      break;

    case 'member':
      this.setMemberExport(exportId, componentId, propertyName);
      break;

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  private setConfigExport(exportId: string, componentId: string, configName: string) {
    const component = this.getComponent(componentId);
    component.plugin.ensureConfig(configName);

    const exports = this.data.exports.config;
    exports[exportId] = { component: component.id, configName };
  }

  private setMemberExport(exportId: string, componentId: string, memberName: string) {
    const component = this.getComponent(componentId);
    component.plugin.ensureMember(memberName);

    const exports = this.data.exports.members;
    exports[exportId] = { component: component.id, member: memberName };
  }

  clearExport(exportType: 'config' | 'member', exportId: string) {
    switch (exportType) {
    case 'config': {
      const exports = this.data.exports.config;
      delete exports[exportId];
      break;
    }

    case 'member': {
      const exports = this.data.exports.members;
      delete exports[exportId];
      break;
    }

    default:
      throw new Error(`Invalid export type: '${exportType}'`);
    }
  }

  renameComponent(id: string, newId: string) {
    super.renameComponent(id, newId);

    for (const configExport of Object.values(this.data.exports.config)) {
      if (configExport.component === id) {
        configExport.component = newId;
      }
    }

    for (const memberExport of Object.values(this.data.exports.members)) {
      if (memberExport.component === id) {
        memberExport.component = newId;
      }
    }
  }

  hasExportWithComponentId(id: string) {
    for (const configExport of Object.values(this.data.exports.config)) {
      if (configExport.component === id) {
        return true;
      }
    }

    for (const memberExport of Object.values(this.data.exports.members)) {
      if (memberExport.component === id) {
        return true;
      }
    }

    return false;
  }
}
