import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { from, Observable } from 'rxjs';
import { concatMap, filter, ignoreElements, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, Epic, ofType, StateObservable } from 'redux-observable';

import { bufferDebounceTime, filterFromState, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { socket } from '../common/rx-socket';
import { ProjectType } from '../projects-list/types';
import { ActionTypes as StatusActionTypes } from '../status/types';
import { isOnline } from '../status/selectors';
import { DesignerTabActionData, OpenedProjectBase } from './designer-types';
import { ProjectUpdate, SetNameProjectNotification, UpdateProjectNotification } from '../../../../shared/project-manager';

interface Parameters<TOpenedProject extends OpenedProjectBase> {
  // defines
  projectType: ProjectType;
  tabType: TabType;

  // selectors
  hasOpenedProjects: (state: AppState) => boolean;
  getOpenedProject: (state: AppState, tabId: string) => TOpenedProject;
  getOpenedProjectsIdAndProjectIdList: (state: AppState) => { id: string; projectId: string }[];
  getOpenedProjectIdByNotifierId: (state: AppState, notifierId: string) => string;

  // action creators
  setNotifier: ({ id, notifierId }: { id: string; notifierId: string }) => Action;
  clearAllNotifiers: () => Action;
  removeOpenedProject: ({ id }: { id: string }) => Action;
  updateProject: (updates: { id: string; update: UpdateProjectNotification }[]) => Action;
  updateTab: (id: string, data: DesignerTabActionData) => Action;

  // project updates (client to server)
  updateMappers: { [actionType: string]: (payload: any) => ProjectUpdate };
}

export function createOpendProjectManagementEpic<TOpenedProject extends OpenedProjectBase>({
  projectType,
  tabType,
  hasOpenedProjects,
  getOpenedProject,
  getOpenedProjectsIdAndProjectIdList,
  getOpenedProjectIdByNotifierId,
  setNotifier,
  clearAllNotifiers,
  removeOpenedProject,
  updateProject,
  updateTab,
  updateMappers,
}: Parameters<TOpenedProject>) {
  const openProjectEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType(TabActionTypes.NEW),
      filter((action: PayloadAction<NewTabAction>) => action.payload.type === tabType),
      mergeMap((action: PayloadAction<NewTabAction>) => {
        const { id, data } = action.payload;
        const { projectId } = data as DesignerTabActionData;
        return openProject(id, projectId);
      })
    );

  const closeProjectEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType<Action, PayloadAction<TabIdAction>>(TabActionTypes.CLOSE),
      withLatestFrom(state$),
      map(([action, state]) => getOpenedProject(state, action.payload.id)),
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
        const hasOpendProjects = hasOpenedProjects(state);
        return online && hasOpendProjects;
      }),
      withSelector(state$, getOpenedProjectsIdAndProjectIdList),
      mergeMap(([, idsAndProjectIds]) => from(idsAndProjectIds)),
      mergeMap(({ id, projectId }) => openProject(id, projectId))
    );

  const offlineEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) =>
    action$.pipe(
      ofType(StatusActionTypes.ONLINE),
      filterFromState(state$, (state) => {
        const online = isOnline(state);
        const hasOpendProjects = hasOpenedProjects(state);
        return !online && hasOpendProjects;
      }),
      map(() => clearAllNotifiers())
    );

  const fetchEpic = (action$: Observable<Action>, state$: StateObservable<AppState>) => {
    const notification$ = socket.notifications();
    return notification$.pipe(
      filterNotification('project-manager/opened-project'),
      withLatestFrom(state$),
      map(([notification, state]) => {
        const id = getOpenedProjectIdByNotifierId(state, notification.notifierId);
        const update = notification.data as UpdateProjectNotification;
        return { id, update };
      }),
      filter((update) => !!update.id), // else project not found => different project type
      bufferDebounceTime(100), // debounce to avoid multiple store updates
      concatMap(createActionFromUpdates)
    );
  };

  const updaters: Epic[] = [];

  for (const [actionType, mapper] of Object.entries(updateMappers)) {
    updaters.push(createProjectUpdateEpic(actionType, mapper));
  }

  return combineEpics(openProjectEpic, closeProjectEpic, onlineEpic, offlineEpic, fetchEpic, ...updaters);

  function openProject(id: string, projectId: string) {
    return openProjectCall(projectType, projectId).pipe(
      map(({ notifierId }) => setNotifier({ id, notifierId })),
      handleError()
    );
  }

  function createProjectUpdateEpic<TActionType, TActionPayload extends { id: string } = any>(actionType: TActionType, mapper: (payload: TActionPayload) => ProjectUpdate) {
    return (action$: Observable<Action>, state$: StateObservable<AppState>) =>
      action$.pipe(
        ofType(actionType),
        withLatestFrom(state$),
        mergeMap(([action, state]: [action: PayloadAction<TActionPayload>, state: AppState]) => {
          const { notifierId } = getOpenedProject(state, action.payload.id);
          const updateData = mapper(action.payload);
          return updateProjectCall(notifierId, updateData).pipe(ignoreElements(), handleError());
        })
      );
  }

  function createActionFromUpdates(updates: { id: string; update: UpdateProjectNotification }[]) {
    const actions = [updateProject(updates)];

    // create additional updates for tabs
    for (const { id, update } of updates) {
      if (update.operation === 'set-name') {
        const typedUpdate = update as SetNameProjectNotification;
        actions.push(updateTab(id, { projectId: typedUpdate.name }));
      }
    }

    return from(actions);
  }
}

function openProjectCall(type: ProjectType, id: string) {
  return socket.call('project-manager/open', { type, id }) as Observable<{ notifierId: string }>;
}

function closeProjectCall(notifierId: string) {
  return socket.call('project-manager/close', { notifierId }) as Observable<void>;
}

function updateProjectCall(notifierId: string, updateData: ProjectUpdate) {
  return socket.call('project-manager/update-opened', { notifierId, updateData }) as Observable<void>;
}
