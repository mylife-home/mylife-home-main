import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateCoreDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes } from './types';
import { UpdateToolboxCoreProjectCall, RenameComponentCoreProjectCall, ClearComponentCoreProjectCall, ClearBindingCoreProjectCall } from '../../../../shared/project-manager';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'core',
  tabType: TabType.CORE_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject, updateProject, updateTab: updateCoreDesignerTab,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId,
  callMappers: {
    [ActionTypes.UPDATE_TOOLBOX]: {
      mapper({ itemType, itemId, action }: { itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }) {
        return { operation: 'update-toolbox', itemType, itemId, action } as UpdateToolboxCoreProjectCall;
      },
    },
    [ActionTypes.RENAME_COMPONENT]: {
      mapper({ componentId, newId }: { componentId: string; newId: string }) {
        return { operation: 'rename-component', componentId, newId } as RenameComponentCoreProjectCall;
      },
    },
    [ActionTypes.CLEAR_COMPONENT]: {
      mapper({ componentId }: { componentId: string }) {
        return { operation: 'clear-component', componentId } as ClearComponentCoreProjectCall;
      },
    },
    [ActionTypes.CLEAR_BINDING]: {
      mapper({ bindingId }: { bindingId: string }) {
        return { operation: 'clear-binding', bindingId } as ClearBindingCoreProjectCall;
      },
    },
    // TODO
  }
});

export default combineEpics(openedProjectManagementEpic);
