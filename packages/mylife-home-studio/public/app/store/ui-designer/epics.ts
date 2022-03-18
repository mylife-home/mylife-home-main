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
        return {
          tabId,
          callData: { operation: 'validate' } as UiProjectCall
        };
      },
      resultMapper(serviceResult: ValidateUiProjectCallResult) {
        return serviceResult.errors;
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_ONLINE]: {
      mapper({ tabId }: { tabId: string }) {
        return {
          tabId,
          callData: { operation: 'refresh-components-from-online' } as UiProjectCall
        };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.REFRESH_COMPONENTS_FROM_PROJECT]: {
      mapper({ tabId, projectId }: { tabId: string; projectId: string }) {
        return {
          tabId,
          callData: { operation: 'refresh-components-from-project', projectId } as RefreshComponentsFromProjectUiProjectCall
        };
      },
      resultMapper(serviceResult: RefreshComponentsUiProjectCallResult) {
        return { breakingOperations: serviceResult.breakingOperations, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_REFRESH_COMPONENTS]: {
      mapper({ tabId, serverData }: { tabId: string; serverData: unknown }) {
        return {
          tabId,
          callData: { operation: 'apply-refresh-components', serverData } as ApplyRefreshComponentsUiProjectCall
        };
      }
    },

    [ActionTypes.DEPLOY_PROJECT]: {
      mapper({ tabId }: { tabId: string }) {
        return {
          tabId,
          callData: { operation: 'deploy' } as UiProjectCall
        };
      },
      resultMapper(serviceResult: DeployUiProjectCallResult) {
        return { validationErrors: serviceResult.validationErrors, deployError: serviceResult.deployError };
      }
    },

    [ActionTypes.SET_DEFAULT_WINDOW]: {
      mapper({ tabId, defaultWindow }: { tabId: string; defaultWindow: DefaultWindow }) {
        const desktop = extractNullableId(defaultWindow.desktop, tabId);
        const mobile = extractNullableId(defaultWindow.mobile, tabId);
        return {
          tabId,
          callData: { operation: 'set-default-window', defaultWindow: { desktop, mobile } } as SetDefaultWindowUiProjectCall
        };
      },
    },

    [ActionTypes.SET_RESOURCE]: {
      mapper({ tabId, resource }: { tabId: string; resource: UiResource }) {
        const { resourceId, ...definition } = resource;
        definition.id = resourceId;
        return {
          tabId,
          callData: { operation: 'set-resource', resource: definition } as SetResourceUiProjectCall
        };
      },
    },

    [ActionTypes.CLEAR_RESOURCE]: {
      mapper({ resourceId }: { resourceId: string }) {
        const { tabId, id } = extractIds(resourceId);
        return {
          tabId,
          callData: { operation: 'clear-resource', id } as ClearResourceUiProjectCall
        };
      },
    },

    [ActionTypes.RENAME_RESOURCE]: {
      mapper({ resourceId, newId }: { resourceId: string; newId: string }) {
        const { tabId, id } = extractIds(resourceId);
        return {
          tabId,
          callData: { operation: 'rename-resource', id, newId } as RenameResourceUiProjectCall
        };
      },
    },

    [ActionTypes.SET_WINDOW]: {
      mapper({ tabId, window }: { tabId: string; window: UiWindow }) {
        const { windowId, ...definition } = window;
        definition.id = windowId;

        // FIXME: translate all ids
        // FIXME: add controls or handle that server side (no control on set)

        return {
          tabId,
          callData: { operation: 'set-window', window: definition } as SetWindowUiProjectCall
        };
      },
    },

    [ActionTypes.CLEAR_WINDOW]: {
      mapper({ windowId }: { windowId: string }) {
        const { tabId, id } = extractIds(windowId);
        return {
          tabId,
          callData: { operation: 'clear-window', id } as ClearWindowUiProjectCall
        };
      },
    },

    [ActionTypes.RENAME_WINDOW]: {
      mapper({ windowId, newId }: { windowId: string; newId: string }) {
        const { tabId, id } = extractIds(windowId);
        return {
          tabId,
          callData: { operation: 'rename-window', id, newId } as RenameWindowUiProjectCall
        };
      },
    },

    [ActionTypes.CLONE_WINDOW]: {
      mapper({ windowId, newId }: { windowId: string; newId: string }) {
        const { tabId, id } = extractIds(windowId);
        return {
          tabId,
          callData: { operation: 'clone-window', id, newId } as CloneWindowUiProjectCall
        };
      },
    },

    [ActionTypes.SET_CONTROL]: {
      mapper({ tabId, windowId, control }: { tabId: string; windowId: string; control: UiControl }) {
        const { controlId, ...definition } = control;
        control.id = controlId;

        // FIXME: translate all ids

        return {
          tabId,
          callData: { operation: 'set-control', windowId, control: definition } as SetControlUiProjectCall
        };
      },
    },

    [ActionTypes.CLEAR_CONTROL]: {
      mapper({ controlId }: { controlId: string }) {
        const { tabId, windowId, id } = extractControlIds(controlId);
        return {
          tabId,
          callData: { operation: 'clear-control', windowId, id } as ClearControlUiProjectCall
        };
      },
    },

    [ActionTypes.RENAME_CONTROL]: {
      mapper({ controlId, newId }: { controlId: string; newId: string }) {
        const { tabId, windowId, id } = extractControlIds(controlId);
        return {
          tabId,
          callData: { operation: 'rename-control', windowId, id, newId } as RenameControlUiProjectCall
        };
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
