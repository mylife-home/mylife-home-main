import { EventEmitter } from 'events';
import crypto from 'crypto';
import { definition as staticDefinition } from './definition';
import { Model, Control, Window } from './model-types';

export * as model from './model-types';

type Definition = typeof staticDefinition;

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

    // FIXME: remove this
    this.update(staticDefinition);
  }

  update(definition: Definition) {
    this.resources.clear();
    const resourceTranslation = new Map<string, string>();

    for (const image of definition.Images) {
      const data = new Buffer(image.Content, 'base64');
      const hash = this.setResource('image/png', data); // for now all png
      resourceTranslation.set(image.Id, hash);
    }

    const model: Model = {
      windows: translateWindows(definition.Windows, resourceTranslation),
      defaultWindow: {
        mobile: definition.MobileDefaultWindow,
        desktop: definition.DesktopDefaultWindow
      }
    };

    const data = Buffer.from(JSON.stringify(model));
    this._modelHash = this.setResource('application/json', data);

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
    background_resource_id: translateResource(window.background_resource_id, resourceTranslation),
    controls: translateControls(window.controls, resourceTranslation)
  }));
}

function translateControls(controls: Control[], resourceTranslation: Map<string, string>) {
  return controls.map(control => {
    if (!control.display) {
      return control;
    }

    const newMap = control.display.map.map((item: any) => ({ ...item, resource_id: translateResource(item.resource_id, resourceTranslation) }));
    const newDisplay = { ...control.display, map: newMap, default_resource_id: translateResource(control.display.default_resource_id, resourceTranslation) };
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