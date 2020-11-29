import { Definition, DefinitionResource, Window } from '../../../shared/ui-model';

namespace oldUi {

  export interface TProject {
    Name: string;
    CreateDate: string; // "/Date(1451942270573)/"
    LastUpdate: string;
    Components: TComponent[];
    Images: TImage[];
    Windows: TWindow[];
    DesktopDefaultWindow: string;
    MobileDefaultWindow: string;
  }

  export interface TComponent {
    Id: string;
    Plugin: TPlugin;
  }

  // TODO: merge with Core
  export interface TPlugin {
    library: string;
    type: string;
    usage: 2; //always ui here
    version: string;
    config: string;
    clazz: string; // ".action|=value,{off;on}" -or- ".action,[0;100]|=value,[0;100]"
  }

  export interface TImage {
    Id: string;
    Content: string; // base64, only png supported
  }

  export interface TWindow {
    id: string;
    height: number;
    width: number;
    style: string; // always ''
    background_resource_id: string;
    controls: TControl[];
  }

  export interface TControl {
    id: string;
    height: number;
    width: number;
    x: number; // fraction of window width
    y: number; // fraction of window height
    style: string; // always ''
    display: TDisplay;
    text: TText;
    primary_action: TAction;
    secondary_action: TAction;
  }

  export interface TDisplay {
    default_resource_id: string;
    component_id: string; // can be null
    component_attribute: string[];
    map: {
      resource_id: string;
      min: number;
      max: number;
      value: string;
    }[];
  }

  export interface TText {
    format: string; // "return value + '%';"
    context: { 
      component_id: string;
      component_attribute: string;
      id: string;
    }[];
  }

  export interface TAction {
    // one set, the other null
    component: {
      component_id: string;
      component_action: string;
    };

    window: {
      id: string;
      popup: boolean;
    };
  }
}

export function convertUiProject(raw: oldUi.TProject): Definition {
  const resources = raw.Images.map(convertResource);
  const windows = raw.Windows.map(convertWindow);

  const defaultWindow = {
    desktop: raw.DesktopDefaultWindow,
    mobile: raw.MobileDefaultWindow,
  };

  return { resources, windows, defaultWindow };
}

function convertResource(raw: oldUi.TImage): DefinitionResource {
  return {
    id: raw.Id,
    mime: 'image/png',
    data: raw.Content
  };
}

function convertWindow(raw: oldUi.TWindow): Window {
  replaceKey(raw, 'background_resource_id', 'backgroundResource');

  for (const control of raw.controls) {
    replaceKey(control, 'primary_action', 'primaryAction');
    replaceKey(control, 'secondary_action', 'secondaryAction');
    replaceKey(control.display, 'default_resource_id', 'defaultResource');
    replaceKey(control.display, 'component_id', 'componentId');
    replaceKey(control.display, 'component_attribute', 'componentState');
    replaceKey(control.primaryAction?.component, 'component_id', 'id');
    replaceKey(control.primaryAction?.component, 'component_action', 'action');
    replaceKey(control.secondaryAction?.component, 'component_id', 'id');
    replaceKey(control.secondaryAction?.component, 'component_action', 'action');

    // replace ids comp_id with comp-id
    replaceComponentId(control.primaryAction?.component, 'id');
    replaceComponentId(control.secondaryAction?.component, 'id');
    replaceComponentId(control.display, 'componentId');

    const context = control.text?.context;
    if (context) {
      for (const item of context) {
        replaceKey(item, 'component_id', 'componentId');
        replaceKey(item, 'component_attribute', 'componentState');
        replaceComponentId(item, 'componentId');
      }
    }

    const map = control.display?.map;
    if (map) {
      for (const item of map) {
        replaceKey(item, 'resource_id', 'resource');

        // replace 'off' 'on' with true false
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