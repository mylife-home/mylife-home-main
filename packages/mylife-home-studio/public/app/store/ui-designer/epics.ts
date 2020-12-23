import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, DefaultWindow, UiResource, UiWindow, UiControl } from './types';
import { ClearResourceUiProjectUpdate, ClearWindowUiProjectUpdate, SetDefaultWindowUiProjectUpdate, SetResourceUiProjectUpdate, SetWindowUiProjectUpdate } from '../../../../shared/project-manager';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'ui',
  tabType: TabType.UI_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject, updateProject, updateTab: updateUiDesignerTab,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId,
  updateMappers: {
    [ActionTypes.SET_DEFAULT_WINDOW]: ({ defaultWindow }: { defaultWindow: DefaultWindow }) => {
      return { operation: 'set-default-window', defaultWindow } as SetDefaultWindowUiProjectUpdate;
    },

    // TODO: component data
    // TODO: RENAME_RESOURCE, RENAME_WINDOW, RENAME_CONTROL

    [ActionTypes.SET_RESOURCE]: ({ resource }: { resource: UiResource }) => {
      return { operation: 'set-resource', resource } as SetResourceUiProjectUpdate;
    },

    [ActionTypes.CLEAR_RESOURCE]: ({ resourceId }: { resourceId: string }) => {
      return { operation: 'clear-resource', id: resourceId } as ClearResourceUiProjectUpdate;
    },

    [ActionTypes.SET_WINDOW]: ({ window }: { window: UiWindow }) => {
      throw new Error('TODO: design shape only for window without control');
      // return { operation: 'set-window', window } as SetWindowUiProjectUpdate;
    },

    [ActionTypes.CLEAR_WINDOW]: ({ windowId }: { windowId: string }) => {
      return { operation: 'clear-window', id: windowId } as ClearWindowUiProjectUpdate;
    },

    [ActionTypes.SET_CONTROL]: ({ control }: { control: UiControl }) => {
      throw new Error('TODO: set control');
    },

    [ActionTypes.CLEAR_CONTROL]: ({ controlId }: { controlId: string }) => {
      throw new Error('TODO: clear control');
    },
  }
});

export default combineEpics(openedProjectManagementEpic);
