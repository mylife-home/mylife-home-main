import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { from, Observable } from 'rxjs';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, ofType, StateObservable } from 'redux-observable';

import { filterFromState, handleError, withSelector } from '../common/rx-operators';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { setNotifier, clearAllNotifiers, removeOpenedProject } from './actions';
import { hasUiDesignerOpenedProjects, getUiDesignerOpenedProject, getUiDesignerOpenedProjectsIdAndProjectIdList } from './selectors';
import { socket } from '../common/rx-socket';
import { ProjectType } from '../projects-list/types';
import { ActionTypes as StatusActionTypes } from '../status/types';
import { isOnline } from '../status/selectors';
import { DesignerNewTabData } from './types';

const openProjectEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(TabActionTypes.NEW),
    filter((action: PayloadAction<NewTabAction>) => action.payload.type === TabType.UI_DESIGNER),
    mergeMap((action: PayloadAction<NewTabAction>) => {
      const { id, data } = action.payload;
      const { projectId } = data as DesignerNewTabData;
      return openProject(id, projectId);
    })
  );

const closeProjectEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType<Action, PayloadAction<TabIdAction>>(TabActionTypes.CLOSE),
    withLatestFrom(state$),
    map(([action, state]) => getUiDesignerOpenedProject(state, action.payload.id)),
    filter((openedProject) => !!openedProject), // else if was another tab type
    mergeMap((openedProject) => {
      const { id, notifierId } = openedProject;
      return closeProjectCall(notifierId).pipe(
        map(() => removeOpenedProject({ id })),
        handleError()
      );
    })
  );

const onlineEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(StatusActionTypes.ONLINE),
    filterFromState(state$, (state) => {
      const online = isOnline(state);
      const hasOpendProjects = hasUiDesignerOpenedProjects(state);
      return online && hasOpendProjects;
    }),
    withSelector(state$, getUiDesignerOpenedProjectsIdAndProjectIdList),
    mergeMap(([, idsAndProjectIds]) => from(idsAndProjectIds)),
    mergeMap(({ id, projectId }) => openProject(id, projectId))
  );

const offlineEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
  action$.pipe(
    ofType(StatusActionTypes.ONLINE),
    filterFromState(state$, (state) => {
      const online = isOnline(state);
      const hasOpendProjects = hasUiDesignerOpenedProjects(state);
      return !online && hasOpendProjects;
    }),
    map(() => clearAllNotifiers())
  );

export default combineEpics(openProjectEpic, closeProjectEpic, onlineEpic, offlineEpic);

function openProject(id: string, projectId: string) {
  return openProjectCall(projectId).pipe(
    map(({ notifierId }) => setNotifier({ id, notifierId })),
    handleError()
  );
}

function openProjectCall(id: string) {
  const type: ProjectType = 'ui';
  return socket.call('project-manager/open', { type, id }) as Observable<{ notifierId: string }>;
}

function closeProjectCall(notifierId: string) {
  return socket.call('project-manager/close', { notifierId }) as Observable<void>;
}
