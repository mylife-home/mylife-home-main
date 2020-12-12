import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { setNotifier, clearAllNotifiers, removeOpenedProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList } from './selectors';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'ui',
  setNotifier, clearAllNotifiers, removeOpenedProject,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList
});

// TODO: project updates

export default combineEpics(openedProjectManagementEpic);
