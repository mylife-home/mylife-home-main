import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, DefaultWindow, UiResource, UiWindow, UiControl } from './types';
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
  SetWindowUiProjectCall,
  SetControlUiProjectCall,
  ValidateUiProjectCallResult,
  RefreshComponentsFromProjectUiProjectCall,
  ApplyRefreshComponentsUiProjectCall,
  RefreshComponentsUiProjectCallResult,
  DeployUiProjectCallResult,
} from '../../../../shared/project-manager';
import { Control } from '../../../../shared/ui-model';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
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
      mapper({ tabId }: { tabId: string }) {
        const callData: UiProjectCall = { operation: 'validate' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: ValidateUiProjectCallResult) {
        return serviceResult.errors;
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE]: {
      mapper({ tabId }: { tabId: string }) {
        const callData: UiProjectCall = { operation: 'refresh-components-from-online' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT]: {
      mapper({ tabId, projectId }: { tabId: string; projectId: string }) {
        const callData: RefreshComponentsFromProjectUiProjectCall = { operation: 'refresh-components-from-project', projectId };
        return { tabId, callData };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_REFRESH_COMPONENTS]: {
      mapper({ tabId, serverData }: { tabId: string; serverData: unknown }) {
        const callData: ApplyRefreshComponentsUiProjectCall = { operation: 'apply-refresh-components', serverData };
        return { tabId, callData };
      }
    },

    [ActionTypes.DEPLOY_PROJECT]: {
      mapper({ tabId }: { tabId: string }) {
        const callData: UiProjectCall = { operation: 'deploy' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: DeployUiProjectCallResult) {
        return { validationErrors: serviceResult.validationErrors, deployError: serviceResult.deployError };
      }
    },

    [ActionTypes.SET_DEFAULT_WINDOW]: {
      mapper({ tabId, defaultWindow }: { tabId: string; defaultWindow: DefaultWindow }) {
        const desktop = extractNullableId(defaultWindow.desktop, tabId);
        const mobile = extractNullableId(defaultWindow.mobile, tabId);
        const callData: SetDefaultWindowUiProjectCall = { operation: 'set-default-window', defaultWindow: { desktop, mobile } };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_RESOURCE]: {
      mapper({ tabId, resource }: { tabId: string; resource: UiResource }) {
        const { resourceId, ...definition } = resource;
        definition.id = resourceId;
        const callData: SetResourceUiProjectCall = { operation: 'set-resource', resource: definition };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_RESOURCE]: {
      mapper({ resourceId }: { resourceId: string }) {
        const { tabId, id } = extractIds(resourceId);
        const callData: ClearResourceUiProjectCall = { operation: 'clear-resource', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_RESOURCE]: {
      mapper({ resourceId, newId }: { resourceId: string; newId: string }) {
        const { tabId, id } = extractIds(resourceId);
        const callData: RenameResourceUiProjectCall = { operation: 'rename-resource', id, newId };
        return { tabId, callData };
      },
    },

    [ActionTypes.SET_WINDOW]: {
      mapper({ tabId, window }: { tabId: string; window: UiWindow }) {
        const { windowId, controls, ...definition } = window;
        
        definition.id = windowId;
        definition.backgroundResource = extractNullableId(definition.backgroundResource, tabId);

        const callData: SetWindowUiProjectCall = { operation: 'set-window', window: definition };
        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_WINDOW]: {
      mapper({ windowId }: { windowId: string }) {
        const { tabId, id } = extractIds(windowId);
        const callData: ClearWindowUiProjectCall = { operation: 'clear-window', id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_WINDOW]: {
      mapper({ windowId, newId }: { windowId: string; newId: string }) {
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

    [ActionTypes.SET_CONTROL]: {
      mapper({ tabId, windowId, control }: { tabId: string; windowId: string; control: UiControl }) {
        const { controlId, ...definition } = control;
        definition.id = controlId;

        const callData: SetControlUiProjectCall = { 
          operation: 'set-control', 
          windowId: extractNullableId(windowId, tabId),
          control: adaptControlLinks(definition, tabId)
        };

        return { tabId, callData };
      },
    },

    [ActionTypes.CLEAR_CONTROL]: {
      mapper({ controlId }: { controlId: string }) {
        const { tabId, windowId, id } = extractControlIds(controlId);
        const callData: ClearControlUiProjectCall = { operation: 'clear-control', windowId, id };
        return { tabId, callData };
      },
    },

    [ActionTypes.RENAME_CONTROL]: {
      mapper({ controlId, newId }: { controlId: string; newId: string }) {
        const { tabId, windowId, id } = extractControlIds(controlId);
        const callData: RenameControlUiProjectCall = { operation: 'rename-control', windowId, id, newId };
        return { tabId, callData };
      },
    },
  }
});

export default combineEpics(openedProjectManagementEpic);

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

function extractControlIds(fullId: string): { tabId: string; windowId: string; id: string; } {
  // first extract tab
  const { tabId, id: remaining } = extractIds(fullId);
  // then extract windowId
  const { tabId: windowId, id } = extractIds(remaining);

  return { tabId, windowId, id };
}

function adaptControlLinks(input: Control, tabId: string): Control {
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
