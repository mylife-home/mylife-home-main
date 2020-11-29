import { DefinitionResource, UiProject, Window, ComponentData } from '../../../../shared/ui-model';
import * as oldUi from './old-ui';

export function convertUiProject(old: oldUi.TProject): UiProject {
  const resources = old.Images.map(convertResource);
  const windows = old.Windows.map(convertWindow);
  const componentData = convertComponents(old.Components);

  const defaultWindow = {
    desktop: old.DesktopDefaultWindow,
    mobile: old.MobileDefaultWindow,
  };

  return {
    name: old.Name,
    definition: { resources, windows, defaultWindow },
    componentData
  };
}

function convertResource(old: oldUi.TImage): DefinitionResource {
  return {
    id: old.Id,
    mime: 'image/png',
    data: old.Content
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

function convertComponents(old: oldUi.TComponent[]): ComponentData {

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