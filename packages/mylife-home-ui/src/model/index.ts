import { EventEmitter } from 'events';
import crypto from 'crypto';
import { logger } from 'mylife-home-common';
import { Model, Control, Window } from '../../shared/model';

export * as model from '../../shared/model';

const log = logger.createLogger('mylife:home:ui:model:model-manager');

export interface Definition {
  readonly resources: DefinitionResource[];
  readonly windows: Window[];
  readonly defaultWindow: { [type: string]: string; };
}

export interface DefinitionResource {
  readonly id: string;
  readonly mime: string;
  readonly data: string;
}

export interface Resource {
  readonly mime: string;
  readonly data: Buffer;
}

export declare interface ModelManager extends EventEmitter {
  on(event: 'update', listener: () => void): this;
  off(event: 'update', listener: () => void): this;
  once(event: 'update', listener: () => void): this;
}

export class ModelManager extends EventEmitter {
  private _modelHash: string;
  private readonly resources = new Map<string, Resource>();

  constructor() {
    super();
  }

  setDefinition(definition: Definition) {
    this.resources.clear();
    const resourceTranslation = new Map<string, string>();

    for (const resource of definition.resources) {
      const data = new Buffer(resource.data, 'base64');
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