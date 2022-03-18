import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, DefaultWindow, UiResource, UiWindow } from './types';
import {
  UiProjectCall,
  ClearResourceUiProjectCall,
  ClearWindowUiProjectCall,
  RenameResourceUiProjectCall,
  RenameWindowUiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetResourceUiProjectCall,
  SetWindowUiProjectCall,
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
        return {
          tabId,
          callData: { operation: 'set-resource', resource } as SetResourceUiProjectCall
        };
      },
    },

    [ActionTypes.CLEAR_RESOURCE]: {
      mapper({ tabId, resourceId }: { tabId: string; resourceId: string }) {
        return {
          tabId,
          callData: { operation: 'clear-resource', id: resourceId } as ClearResourceUiProjectCall
        };
      },
    },

    [ActionTypes.RENAME_RESOURCE]: {
      mapper({ tabId, resourceId, newId }: { tabId: string; resourceId: string; newId: string }) {
        return {
          tabId,
          callData: { operation: 'rename-resource', id: resourceId, newId } as RenameResourceUiProjectCall
        };
      },
    },

    [ActionTypes.SET_WINDOW]: {
      mapper({ tabId, window }: { tabId: string; window: UiWindow }) {
        return {
          tabId,
          callData: { operation: 'set-window', window } as SetWindowUiProjectCall
        };
      },
    },

    [ActionTypes.CLEAR_WINDOW]: {
      mapper({ tabId, windowId }: { tabId: string; windowId: string }) {
        return {
          tabId,
          callData: { operation: 'clear-window', id: windowId } as ClearWindowUiProjectCall
        };
      },
    },

    [ActionTypes.RENAME_WINDOW]: {
      mapper({ tabId, windowId, newId }: { tabId: string; windowId: string; newId: string }) {
        return {
          tabId,
          callData: { operation: 'rename-window', id: windowId, newId } as RenameWindowUiProjectCall
        };
      },
    },
  }
});

export default combineEpics(openedProjectManagementEpic);

function extractIds(fullId: string): { tabId: string, id: string; } {
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