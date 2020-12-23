import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateUiDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, DefaultWindow, UiResource, UiWindow, UiControl } from './types';
import {
  ClearControlUiProjectUpdate,
  ClearResourceUiProjectUpdate,
  ClearWindowUiProjectUpdate,
  RenameControlUiProjectUpdate,
  RenameResourceUiProjectUpdate,
  RenameWindowUiProjectUpdate,
  SetControlUiProjectUpdate,
  SetDefaultWindowUiProjectUpdate,
  SetResourceUiProjectUpdate,
  SetWindowUiProjectUpdate,
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

    [ActionTypes.RENAME_RESOURCE]: ({ resourceId, newId }: { resourceId: string; newId: string }) => {
      return { operation: 'rename-resource', id: resourceId, newId } as RenameResourceUiProjectUpdate;
    },

    [ActionTypes.SET_WINDOW]: ({ window }: { window: UiWindow }) => {
      const { controls, ...windowOnly } = window;
      return { operation: 'set-window', window: windowOnly } as SetWindowUiProjectUpdate;
    },

    [ActionTypes.CLEAR_WINDOW]: ({ windowId }: { windowId: string }) => {
      return { operation: 'clear-window', id: windowId } as ClearWindowUiProjectUpdate;
    },

    [ActionTypes.RENAME_WINDOW]: ({ windowId, newId }: { windowId: string; newId: string }) => {
      return { operation: 'rename-window', id: windowId, newId } as RenameWindowUiProjectUpdate;
    },

    [ActionTypes.SET_CONTROL]: ({ control }: { control: UiControl }) => {
      const [windowId, id] = control.id.split(':');
      return { operation: 'set-control', windowId, control: { ...control, id } } as SetControlUiProjectUpdate;
    },

    [ActionTypes.CLEAR_CONTROL]: ({ windowId, controlId }: { windowId: string; controlId: string }) => {
      return { operation: 'clear-control', windowId, id: controlId } as ClearControlUiProjectUpdate;
    },

    [ActionTypes.RENAME_CONTROL]: ({ windowId, controlId, newId }: { windowId: string; controlId: string; newId: string }) => {
      return { operation: 'rename-control', windowId, id: controlId, newId } as RenameControlUiProjectUpdate;
    },
  },
});

export default combineEpics(openedProjectManagementEpic);
