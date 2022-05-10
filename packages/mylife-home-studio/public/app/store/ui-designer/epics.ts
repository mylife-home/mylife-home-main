import { createProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, UiControl, ActionPayloads, UiViewType } from './types';
import {
  UiProjectCall,
  ClearResourceUiProjectCall,
  ClearWindowUiProjectCall,
  ClearControlUiProjectCall,
  RenameResourceUiProjectCall,
  RenameWindowUiProjectCall,
  RenameControlUiProjectCall,
  CloneWindowUiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetResourceUiProjectCall,
  ValidateUiProjectCallResult,
  RefreshComponentsFromProjectUiProjectCall,
  ApplyRefreshComponentsUiProjectCall,
  RefreshComponentsUiProjectCallResult,
  DeployUiProjectCallResult,
  NewControlUiProjectCall,
  CloneControlUiProjectCall,
  SetControlPropertiesUiProjectCall,
  NewWindowUiProjectCall,
  SetWindowPropertiesUiProjectCall,
  SetStyleUiProjectCall,
  ClearStyleUiProjectCall,
  RenameStyleUiProjectCall,
  NewTemplateUiProjectCall,
  ClearTemplateUiProjectCall,
  RenameTemplateUiProjectCall,
  CloneTemplateUiProjectCall,
  SetTemplatePropertiesUiProjectCall,
  NewTemplateInstanceUiProjectCall,
  ClearTemplateInstanceUiProjectCall,
  RenameTemplateInstanceUiProjectCall,
  CloneTemplateInstanceUiProjectCall,
  SetTemplateInstancePropertiesUiProjectCall,
} from '../../../../shared/project-manager';

type ControlProperties = Partial<Omit<UiControl, 'id' | 'controlId'>>;

export default createProjectManagementEpic({
  projectType: 'ui',
  tabType: TabType.UI_DESIGNER,
  setNotifier,
  clearAllNotifiers,
  removeOpenedProject,
  updateProject,
  updateTab: updateUiDesignerTab,
  hasOpenedProjects,
  getOpenedProject,
  getOpenedProjectsIdAndProjectIdList,
  getOpenedProjectIdByNotifierId,
  callMappers: {
    [ActionTypes.VALIDATE_PROJECT]: {
      mapper({ tabId }: ActionPayloads.ValidateProject) {
        const callData: UiProjectCall = { operation: 'validate' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: ValidateUiProjectCallResult) {
        return serviceResult.errors;
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE]: {
      mapper({ tabId }: ActionPayloads.RefreshComponentsFromOnline) {
        const callData: UiProjectCall = { operation: 'refresh-components-from-online' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT]: {
      mapper({ tabId, projectId }: ActionPayloads.RefreshComponentsFromProject) {
        const callData: RefreshComponentsFromProjectUiProjectCall = { operation: 'refresh-components-from-project', projectId };
        return { tabId, callData };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_REFRESH_COMPONENTS]: {
      mapper({ tabId, serverData }: ActionPayloads.ApplyRefreshComponents) {
        const callData: ApplyRefreshComponentsUiProjectCall = { operation: 'apply-refresh-components', serverData };
        return { tabId, callData };
      }
    },

    [ActionTypes.DEPLOY_PROJECT]: {
      mapper({ tabId }: ActionPayloads.DeployProject) {
        const callData: UiProjectCall = { operation: 'deploy' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: DeployUiProjectCallResult) {
        return { validationErrors: serviceResult.validationErrors, deployError: serviceResult.deployError };
      }
    },

    [ActionTypes.SET_DEFAULT_WINDOW]: {
      mapper({ tabId, defaultWindow }: ActionPayloads.SetDefaultWindow) {
        const desktop = extractNullableId(defaultWindow.desktop, tabId);
        const mobile = extractNullableId(defaultWindow.mobile, tabId);
        const callData: SetDefaultWindowUiProjectCall = { operation: 'set-default-window', defaultWindow: { desktop, mobile } };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_RESOURCE]: {
      mapper({ tabId, resource }: ActionPayloads.SetResource) {
        const { id, resourceId, ...resourceData } = resource;
        const callData: SetResourceUiProjectCall = { operation: 'set-resource', id: resourceId, resource: resourceData };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_RESOURCE]: {
      mapper({ resourceId }: ActionPayloads.ClearResource) {
        const { tabId, id } = extractIds(resourceId);
        const callData: ClearResourceUiProjectCall = { operation: 'clear-resource', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_RESOURCE]: {
      mapper({ resourceId, newId }: ActionPayloads.RenameResource) {
        const { tabId, id } = extractIds(resourceId);
        const callData: RenameResourceUiProjectCall = { operation: 'rename-resource', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_STYLE]: {
      mapper({ tabId, style }: ActionPayloads.SetStyle) {
        const { id, styleId, ...styleData } = style;
        const callData: SetStyleUiProjectCall = { operation: 'set-style', id: styleId, style: styleData };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_STYLE]: {
      mapper({ styleId }: ActionPayloads.ClearStyle) {
        const { tabId, id } = extractIds(styleId);
        const callData: ClearStyleUiProjectCall = { operation: 'clear-style', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_STYLE]: {
      mapper({ styleId, newId }: ActionPayloads.RenameStyle) {
        const { tabId, id } = extractIds(styleId);
        const callData: RenameStyleUiProjectCall = { operation: 'rename-style', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.NEW_WINDOW]: {
      mapper({ tabId, newId }: ActionPayloads.NewWindow) {
        const callData: NewWindowUiProjectCall = { operation: 'new-window', id: newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_WINDOW]: {
      mapper({ windowId }: ActionPayloads.ClearWindow) {
        const { tabId, id } = extractIds(windowId);
        const callData: ClearWindowUiProjectCall = { operation: 'clear-window', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_WINDOW]: {
      mapper({ windowId, newId }: ActionPayloads.RenameWindow) {
        const { tabId, id } = extractIds(windowId);
        const callData: RenameWindowUiProjectCall = { operation: 'rename-window', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLONE_WINDOW]: {
      mapper({ windowId, newId }: { windowId: string; newId: string }) {
        const { tabId, id } = extractIds(windowId);
        const callData: CloneWindowUiProjectCall = { operation: 'clone-window', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_WINDOW_PROPERTIES]: {
      mapper({ windowId, properties }: ActionPayloads.SetWindowProperties) {
        const { tabId, id } = extractIds(windowId);

        const fixedProps = { ... properties };
        if (fixedProps.backgroundResource) {
          fixedProps.backgroundResource = extractNullableId(fixedProps.backgroundResource, tabId);
        }

        if (fixedProps.style) {
          fixedProps.style = fixedProps.style.map(id => extractNullableId(id, tabId));
        }

        const callData: SetWindowPropertiesUiProjectCall = { operation: 'set-window-properties', id, properties: fixedProps };
        return { tabId, callData };
      },
      debounce: {
        keyBuilder({ windowId }: ActionPayloads.SetWindowProperties) {
          return windowId;
        },
        valueMerger(prevValue: ActionPayloads.SetWindowProperties, newValue: ActionPayloads.SetWindowProperties): ActionPayloads.SetWindowProperties {
          const properties = { ...prevValue.properties, ...newValue.properties };
          return { ...newValue, properties };
        }
      },
    },

    [ActionTypes.NEW_TEMPLATE]: {
      mapper({ tabId, newId }: ActionPayloads.NewTemplate) {
        const callData: NewTemplateUiProjectCall = { operation: 'new-template', id: newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_TEMPLATE]: {
      mapper({ templateId }: ActionPayloads.ClearTemplate) {
        const { tabId, id } = extractIds(templateId);
        const callData: ClearTemplateUiProjectCall = { operation: 'clear-template', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_TEMPLATE]: {
      mapper({ templateId, newId }: ActionPayloads.RenameTemplate) {
        const { tabId, id } = extractIds(templateId);
        const callData: RenameTemplateUiProjectCall = { operation: 'rename-template', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLONE_TEMPLATE]: {
      mapper({ templateId, newId }: { templateId: string; newId: string }) {
        const { tabId, id } = extractIds(templateId);
        const callData: CloneTemplateUiProjectCall = { operation: 'clone-template', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_TEMPLATE_PROPERTIES]: {
      mapper({ templateId, properties }: ActionPayloads.SetTemplateProperties) {
        const { tabId, id } = extractIds(templateId);
        const callData: SetTemplatePropertiesUiProjectCall = { operation: 'set-template-properties', id, properties };
        return { tabId, callData };
      },
      debounce: {
        keyBuilder({ templateId }: ActionPayloads.SetTemplateProperties) {
          return templateId;
        },
        valueMerger(prevValue: ActionPayloads.SetTemplateProperties, newValue: ActionPayloads.SetTemplateProperties): ActionPayloads.SetTemplateProperties {
          const properties = { ...prevValue.properties, ...newValue.properties };
          return { ...newValue, properties };
        }
      },
    },

    [ActionTypes.NEW_CONTROL]: {
      mapper({ viewType, viewId, newId, x, y }: ActionPayloads.NewControl) {
        const { tabId, id } = extractIds(viewId);
        const callData: NewControlUiProjectCall = { operation: 'new-control', viewType, viewId: id, id: newId, x, y };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_CONTROL]: {
      mapper({ controlId }: ActionPayloads.ClearControl) {
        const { tabId, viewType, viewId, id } = extractControlIds(controlId);
        const callData: ClearControlUiProjectCall = { operation: 'clear-control', viewType, viewId, id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_CONTROL]: {
      mapper({ controlId, newId }: ActionPayloads.RenameControl) {
        const { tabId, viewType, viewId, id } = extractControlIds(controlId);
        const callData: RenameControlUiProjectCall = { operation: 'rename-control', viewType, viewId, id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLONE_CONTROL]: {
      mapper({ controlId, newId }: ActionPayloads.CloneControl) {
        const { tabId, viewType, viewId, id } = extractControlIds(controlId);
        const callData: CloneControlUiProjectCall = { operation: 'clone-control', viewType, viewId, id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_CONTROL_PROPERTIES]: {
      mapper({ controlId, properties }: ActionPayloads.SetControlProperties) {
        const { tabId, viewType, viewId, id } = extractControlIds(controlId);

        const fixedProps = adaptControlLinks(properties, tabId);

        if (fixedProps.style) {
          fixedProps.style = fixedProps.style.map(id => extractNullableId(id, tabId));
        }

        const callData: SetControlPropertiesUiProjectCall = { operation: 'set-control-properties', viewType, viewId, id, properties: fixedProps };
        return { tabId, callData };
      },
      debounce: {
        keyBuilder({ controlId }: ActionPayloads.SetControlProperties) {
          return controlId;
        },
        valueMerger(prevValue: ActionPayloads.SetControlProperties, newValue: ActionPayloads.SetControlProperties): ActionPayloads.SetControlProperties {
          const properties = { ...prevValue.properties, ...newValue.properties };
          return { ...newValue, properties };
        }
      },
    },


    [ActionTypes.NEW_TEMPLATE_INSTANCE]: {
      mapper({ viewType, viewId, newId, templateId: fullTemplateId, x, y }: ActionPayloads.NewTemplateInstance) {
        const { tabId, id } = extractIds(viewId);
        const templateId = extractNullableId(fullTemplateId, tabId);
        const callData: NewTemplateInstanceUiProjectCall = { operation: 'new-template-instance', viewType, viewId: id, id: newId, templateId, x, y };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_TEMPLATE_INSTANCE]: {
      mapper({ templateInstanceId }: ActionPayloads.ClearTemplateInstance) {
        const { tabId, viewType, viewId, id } = extractTemplateInstanceIds(templateInstanceId);
        const callData: ClearTemplateInstanceUiProjectCall = { operation: 'clear-template-instance', viewType, viewId, id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_TEMPLATE_INSTANCE]: {
      mapper({ templateInstanceId, newId }: ActionPayloads.RenameTemplateInstance) {
        const { tabId, viewType, viewId, id } = extractTemplateInstanceIds(templateInstanceId);
        const callData: RenameTemplateInstanceUiProjectCall = { operation: 'rename-template-instance', viewType, viewId, id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLONE_TEMPLATE_INSTANCE]: {
      mapper({ templateInstanceId, newId }: ActionPayloads.CloneTemplateInstance) {
        const { tabId, viewType, viewId, id } = extractTemplateInstanceIds(templateInstanceId);
        const callData: CloneTemplateInstanceUiProjectCall = { operation: 'clone-template-instance', viewType, viewId, id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_TEMPLATE_INSTANCE_PROPERTIES]: {
      mapper({ templateInstanceId, properties }: ActionPayloads.SetTemplateInstanceProperties) {
        const { tabId, viewType, viewId, id } = extractTemplateInstanceIds(templateInstanceId);

        const fixedProps = { ... properties };

        if (fixedProps.templateId) {
          fixedProps.templateId = extractNullableId(fixedProps.templateId, tabId);
        }

        const callData: SetTemplateInstancePropertiesUiProjectCall = { operation: 'set-template-instance-properties', viewType, viewId, id, properties: fixedProps };
        return { tabId, callData };
      },
      debounce: {
        keyBuilder({ templateInstanceId }: ActionPayloads.SetTemplateInstanceProperties) {
          return templateInstanceId;
        },
        valueMerger(prevValue: ActionPayloads.SetTemplateInstanceProperties, newValue: ActionPayloads.SetTemplateInstanceProperties): ActionPayloads.SetTemplateInstanceProperties {
          const properties = { ...prevValue.properties, ...newValue.properties };
          return { ...newValue, properties };
        }
      },
    },
  }
});

function extractIds(fullId: string): { tabId: string; id: string; } {
  const sepPos = fullId.indexOf(':');
  if (sepPos < 0) {
    throw new Error(`Bad id: '${fullId}'`);
  }

  return {
    tabId: fullId.substring(0, sepPos),
    id: fullId.substring(sepPos + 1),
  };
}

function extractNullableId(fullId: string, expectedTabId: string) {
  if (!fullId) {
    return fullId;
  }

  const { tabId, id } = extractIds(fullId);
  if (tabId !== expectedTabId) {
    throw new Error(`Project id mismatch! ('${tabId}' !== '${expectedTabId}')`);
  }

  return id;
}

function extractControlIds(fullId: string): { tabId: string; viewType: UiViewType; viewId: string; id: string; } {
  // first extract tab
  const { tabId, id: remaining1 } = extractIds(fullId);
  // then extract viewId
  const { tabId: viewId, id: remaining2 } = extractIds(remaining1);
  // then extract viewType
  const { tabId: viewType, id } = extractIds(remaining2);

  return { tabId, viewType: viewType as UiViewType, viewId, id };
}

function adaptControlLinks(input: ControlProperties, tabId: string): ControlProperties {
  const control = { ... input };

  for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
    if (!control[aid]) {
      continue;
    }

    if (control[aid].window) {
      control[aid] = { 
        ... control[aid],
        window: {
          ... control[aid].window,
          id: extractNullableId(control[aid].window.id, tabId)
        },
      };
    }
    
    if (control[aid].component) {
      control[aid] = { 
        ... control[aid],
        component: {
          ... control[aid].component,
          id: extractNullableId(control[aid].component.id, tabId)
        },
      };
    }
  }

  if (control.display) {
    control.display = {
      ...control.display,
      componentId: extractNullableId(control.display.componentId, tabId),
      defaultResource: extractNullableId(control.display.defaultResource, tabId),
      map: control.display.map.map(({ resource, ...item }) => ({ ...item, resource: extractNullableId(resource, tabId) }))
    };
  }

  if (control.text) {
    control.text = {
      ...control.text,
      context: control.text.context.map(({ componentId, ...item }) => ({ ...item, componentId: extractNullableId(componentId, tabId) }))
    };
  }

  return control;
}

function extractTemplateInstanceIds(fullId: string) {
  return extractControlIds(fullId);
}
