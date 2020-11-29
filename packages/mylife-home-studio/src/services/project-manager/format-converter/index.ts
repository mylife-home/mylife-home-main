import { DefinitionResource, UiProject, Window, ComponentData } from '../../../../shared/ui-model';
import * as uiV1 from './ui-v1-types';

export function convertUiProject(input: uiV1.Project): UiProject {
  const resources = input.Images.map(convertResource);
  const windows = input.Windows.map(convertWindow);
  const componentData = convertComponents(input.Components);

  const defaultWindow = {
    desktop: input.DesktopDefaultWindow,
    mobile: input.MobileDefaultWindow,
  };

  return {
    name: input.Name,
    definition: { resources, windows, defaultWindow },
    componentData
  };
}

function convertResource(input: uiV1.Image): DefinitionResource {
  return {
    id: input.Id,
    mime: 'image/png',
    data: input.Content
  };
}

function convertWindow(input: uiV1.Window): Window {
  replaceKey(input, 'background_resource_id', 'backgroundResource');

  for (const control of input.controls) {
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

  return input;
}

function convertComponents(old: uiV1.Component[]): ComponentData {

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