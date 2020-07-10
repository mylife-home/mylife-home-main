import raw from './ui_main.json';
import { Window } from '../../shared/model';

export interface Resource {
  readonly id: string;
  readonly mime: string;
  readonly data: string;
}

export interface Definition {
  readonly resources: Resource[];
  readonly windows: Window[];
  readonly defaultWindow: { [type: string]: string; };
}

export const staticDefinition = prepareDefinition();

function prepareDefinition(): Definition {
  const resources = raw.Images.map(prepareResource);
  const windows = raw.Windows.map(prepareWindow);

  const defaultWindow = {
    desktop: raw.DesktopDefaultWindow,
    mobile: raw.MobileDefaultWindow,
  };

  return { resources, windows, defaultWindow };
}

function prepareResource(raw: any): Resource {
  return {
    id: raw.Id,
    mime: 'image/png',
    data: raw.Content
  };
}

function prepareWindow(raw: any): Window {
  // replaceKey(window, 'background_resource_id', 'backgroundResource');

  for (const control of raw.controls) {
    // replace ids comp_id with comp-id
    replaceComponentId(control.primary_action?.component, 'component_id');
    replaceComponentId(control.secondary_action?.component, 'component_id');
    replaceComponentId(control.display, 'component_id');

    const context = control.text?.context;
    if (context) {
      for (const item of context) {
        replaceComponentId(item, 'component_id');
      }
    }

    // replace 'off' 'on' with true false
    const map = control.display?.map;
    if (map) {
      for (const item of map) {
        switch (item.value) {
          case 'on':
            item.value = true;
            break;
          case 'off':
            item.value = false;
            break;
        }
      }
    }
  }

  return raw;
}

function replaceComponentId(obj: { [prop: string]: string; }, prop: string) {
  if (obj && obj[prop]) {
    obj[prop] = obj[prop].replace(/_/g, '-');
  }
}

function replaceKey(obj: { [prop: string]: string; }, oldName: string, newName: string) {
  if (obj) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
}