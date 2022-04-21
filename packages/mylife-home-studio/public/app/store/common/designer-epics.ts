import { Action } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { from, Observable } from 'rxjs';
import { concatMap, filter, groupBy, ignoreElements, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineEpics, Epic, ofType, StateObservable } from 'redux-observable';

import { bufferDebounceTime, debounceTimeKey, filterFromState, filterNotification, handleError, withSelector } from '../common/rx-operators';
import { AppState } from '../types';
import { ActionTypes as TabActionTypes, NewTabAction, TabIdAction, TabType } from '../tabs/types';
import { socket } from '../common/rx-socket';
import { ProjectType } from '../projects-list/types';
import { ActionTypes as StatusActionTypes } from '../status/types';
import { isOnline } from '../status/selectors';
import { DesignerTabActionData, OpenedProjectBase } from './designer-types';
import { ProjectCall, ProjectCallResult, SetNameProjectNotification, UpdateProjectNotification } from '../../../../shared/project-manager';
import { DeferredPayload } from './async-action';

interface MapperResult {
  tabId: string;
  callData: ProjectCall;
}

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
  setNotifier: ({ tabId, notifierId }: { tabId: string; notifierId: string }) => Action;
  clearAllNotifiers: () => Action;
  removeOpenedProject: ({ tabId }: { tabId: string }) => Action;
  updateProject: (updates: { tabId: string; update: UpdateProjectNotification }[]) => Action;
  updateTab: (tabId: string, data: DesignerTabActionData) => Action;

  // project calls
  callMappers: { [actionType: string]: {
    mapper: (payload: any) => MapperResult;
    resultMapper?: (payload: ProjectCallResult) => unknown;
    debounce?: (payload: any) => string; // key builder for debouncing
  } }
}

export function createProjectManagementEpic<TOpenedProject extends OpenedProjectBase>({
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
  callMappers,
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
          map(() => removeOpenedProject({ tabId: id })),
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
        const tabId = getOpenedProjectIdByNotifierId(state, notification.notifierId);
        const update = notification.data as UpdateProjectNotification;
        return { tabId, update };
      }),
      filter((update) => !!update.tabId), // else project not found => different project type
      bufferDebounceTime(100), // debounce to avoid multiple store updates
      concatMap(createActionFromUpdates)
    );
  };

  const calls: Epic[] = [];

  for (const [actionType, { mapper, resultMapper }] of Object.entries(callMappers)) {
    calls.push(createProjectCallEpic(actionType, mapper, resultMapper));
  }

  const epics = combineEpics(openProjectEpic, closeProjectEpic, onlineEpic, offlineEpic, fetchEpic, ...calls);

  return function debounceManager(action$: Observable<Action>, state$: StateObservable<AppState>) {
    const debounced$ = action$.pipe(
      map(action => ({ action, data: buildActionData(action) })),
      groupBy(actionWithData => actionWithData.data.tabId),
      mergeMap(group => group.pipe(debounceTimeKey(actionWithData => actionWithData.data.debounceKey, 3000))),
      map(actionWithData => actionWithData.action)
    );

    return epics(debounced$, state$);
  }

  function buildActionData(action: Action) {
    if (action.type === TabActionTypes.CLOSE) {
      return { tabId: (action as PayloadAction<TabIdAction>).payload.id, debounceKey: null };
    }

    const callMapper = callMappers[action.type];
    if (!callMapper) {
      return { tabId: null, debounceKey: null};
    }

    const { tabId } = callMapper.mapper((action as PayloadAction).payload);
    if (!callMapper.debounce) {
      return { tabId, debounceKey: null };
    }

    const debounceKey = callMapper.debounce((action as PayloadAction).payload);
    return { tabId, debounceKey: `${action.type}$${debounceKey}` };
  }

  function openProject(tabId: string, projectId: string) {
    return openProjectCall(projectType, projectId).pipe(
      map(({ notifierId }) => setNotifier({ tabId, notifierId })),
      handleError()
    );
  }

  function createProjectCallEpic<TActionType, TActionResult = any, TActionPayload extends { id: string } & DeferredPayload<TActionResult> = any>(
    actionType: TActionType,
    mapper: (payload: TActionPayload) => MapperResult,
    resultMapper: (serviceResult: ProjectCallResult) => TActionResult = (serviceResult) => serviceResult as any
  ) {
    return (action$: Observable<Action>, state$: StateObservable<AppState>) =>
      action$.pipe(
        ofType(actionType),
        withLatestFrom(state$),
        mergeMap(([action, state]: [action: PayloadAction<TActionPayload>, state: AppState]) => {
          const { tabId, callData } = mapper(action.payload);
          const { notifierId } = getOpenedProject(state, tabId);
          return callProjectCall(notifierId, callData).pipe(
            map((serviceResult: ProjectCallResult) => { action.payload.resolve(resultMapper(serviceResult)); }),
            ignoreElements(),
            handleError()
          );
        })
      );
  }

  function createActionFromUpdates(updates: { tabId: string; update: UpdateProjectNotification }[]) {
    const actions = [updateProject(updates)];

    // create additional updates for tabs
    for (const { tabId, update } of updates) {
      if (update.operation === 'set-name') {
        const typedUpdate = update as SetNameProjectNotification;
        actions.push(updateTab(tabId, { projectId: typedUpdate.name }));
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

function callProjectCall(notifierId: string, callData: ProjectCall) {
  return socket.call('project-manager/call-opened', { notifierId, callData }) as Observable<ProjectCallResult>;
}
