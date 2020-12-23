import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, DefaultWindow, UiResource, UiWindow } from './types';
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

    // TODO: SET/CLEAR_CONTROL update controls too

    [ActionTypes.CLEAR_WINDOW]: ({ windowId }: { windowId: string }) => {
      return { operation: 'clear-window', id: windowId } as ClearWindowUiProjectUpdate;
    },
  }
});

export default combineEpics(openedProjectManagementEpic);
