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
  ProjectCallResult,
  RenameResourceUiProjectCall,
  RenameWindowUiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetResourceUiProjectCall,
  SetWindowUiProjectCall,
  ValidateUiProjectCallResult,
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
      mapper() {
        return { operation: 'validate' } as UiProjectCall;
      },
      resultMapper(serviceResult: ValidateUiProjectCallResult) {
        return serviceResult.errors;
      }
    },

    [ActionTypes.SET_DEFAULT_WINDOW]: {
      mapper({ defaultWindow }: { defaultWindow: DefaultWindow }) {
        return { operation: 'set-default-window', defaultWindow } as SetDefaultWindowUiProjectCall;
      },
    },

    // TODO: component data

    [ActionTypes.SET_RESOURCE]: {
      mapper({ resource }: { resource: UiResource }) {
        return { operation: 'set-resource', resource } as SetResourceUiProjectCall;
      },
    },

    [ActionTypes.CLEAR_RESOURCE]: {
      mapper({ resourceId }: { resourceId: string }) {
        return { operation: 'clear-resource', id: resourceId } as ClearResourceUiProjectCall;
      },
    },

    [ActionTypes.RENAME_RESOURCE]: {
      mapper({ resourceId, newId }: { resourceId: string; newId: string }) {
        return { operation: 'rename-resource', id: resourceId, newId } as RenameResourceUiProjectCall;
      },
    },

    [ActionTypes.SET_WINDOW]: {
      mapper({ window }: { window: UiWindow }) {
        return { operation: 'set-window', window } as SetWindowUiProjectCall;
      },
    },

    [ActionTypes.CLEAR_WINDOW]: {
      mapper({ windowId }: { windowId: string }) {
        return { operation: 'clear-window', id: windowId } as ClearWindowUiProjectCall;
      },
    },

    [ActionTypes.RENAME_WINDOW]: {
      mapper({ windowId, newId }: { windowId: string; newId: string }) {
        return { operation: 'rename-window', id: windowId, newId } as RenameWindowUiProjectCall;
      },
    },
  }
});

export default combineEpics(openedProjectManagementEpic);
