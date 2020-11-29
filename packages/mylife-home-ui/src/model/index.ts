import { EventEmitter } from 'events';
import crypto from 'crypto';
import { logger } from 'mylife-home-common';
import { Model, Control, Window } from '../../shared/model';
import { Definition, DefinitionResource } from './definition';

export * as model from '../../shared/model';
export  { Definition, DefinitionResource };

const log = logger.createLogger('mylife:home:ui:model:model-manager');

export interface Resource {
  readonly mime: string;
  readonly data: Buffer;
}

export interface RequiredComponentState {
  readonly componentId: string;
  readonly componentState: string;
}

export declare interface ModelManager extends EventEmitter {
  on(event: 'update', listener: () => void): this;
  off(event: 'update', listener: () => void): this;
  once(event: 'update', listener: () => void): this;
}

export class ModelManager extends EventEmitter {
  private _modelHash: string;
  private readonly resources = new Map<string, Resource>();
  private _requiredComponentStates: RequiredComponentState[];

  constructor() {
    super();
  }

  setDefinition(definition: Definition) {
    this.resources.clear();
    const resourceTranslation = new Map<string, string>();

    for (const resource of definition.resources) {
      const data = Buffer.from(resource.data, 'base64');
      const hash = this.setResource(resource.mime, data); // for now all png
      resourceTranslation.set(resource.id, hash);
      log.info(`Creating resource from id '${resource.id}': hash='${hash}', size='${data.length}'`);
    }

    const model: Model = {
      windows: translateWindows(definition.windows, resourceTranslation),
      defaultWindow: definition.defaultWindow
    };

    const data = Buffer.from(JSON.stringify(model));
    this._modelHash = this.setResource('application/json', data);
    log.info(`Creating resource from model: hash='${this._modelHash}', size='${data.length}'`);

    this._requiredComponentStates = extractRequiredComponentStates(model);

    this.emit('update');
  }

  private setResource(mime: string, data: Buffer) {
    const hash = computeHash(data);
    this.resources.set(hash, { mime, data });
    return hash;
  }

  get modelHash() {
    return this._modelHash;
  }

  get requiredComponentStates() {
    return this._requiredComponentStates;
  }

  getResource(hash: string): Resource {
    const resource = this.resources.get(hash);
    if (!resource) {
      throw new Error(`Resoure with hash '${hash}' does not exist`);
    }
    return resource;
  }
}

function computeHash(data: Buffer) {
  return crypto.createHash('md5').update(data).digest('base64');
}

function translateWindows(windows: Window[], resourceTranslation: Map<string, string>) {
  return windows.map(window => ({
    ...window,
    backgroundResource: translateResource(window.backgroundResource, resourceTranslation),
    controls: translateControls(window.controls, resourceTranslation)
  }));
}

function translateControls(controls: Control[], resourceTranslation: Map<string, string>) {
  return controls.map(control => {
    if (!control.display) {
      return control;
    }

    const newMap = control.display.map.map((item: any) => ({ ...item, resource: translateResource(item.resource, resourceTranslation) }));
    const newDisplay = { ...control.display, map: newMap, defaultResource: translateResource(control.display.defaultResource, resourceTranslation) };
    return { ...control, display: newDisplay };
  });
}

function translateResource(id: string, resourceTranslation: Map<string, string>) {
  if (!id) {
    return id;
  }
  const hash = resourceTranslation.get(id);
  if (!hash) {
    throw new Error(`Resource not found: '${id}`);
  }
  return hash;
};

function extractRequiredComponentStates(model: Model): RequiredComponentState[] {
  const list: RequiredComponentState[] = [];

  for (const window of model.windows) {
    for (const { display, text } of window.controls) {

      if (display && display.componentId && display.componentState) {
        list.push({ componentId: display.componentId, componentState: display.componentState });
      }

      if (text && text.context) {
        for (const { componentId, componentState } of text.context) {
          list.push({ componentId, componentState });
        }
      }

    }
  }

  return list;
}