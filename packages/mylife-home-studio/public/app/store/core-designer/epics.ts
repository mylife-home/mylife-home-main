import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { setNotifier, clearAllNotifiers, removeOpenedProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList } from './selectors';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'core',
  tabType: TabType.CORE_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList
});

// TODO: project updates

export default combineEpics(openedProjectManagementEpic);
