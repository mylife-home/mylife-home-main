import { AppState } from '../types';

const getStatus = (state: AppState) => state.status;
export const isOnline = (state: AppState) => getStatus(state).online;
export const getError = (state: AppState) => getStatus(state).error;
export const getRunningRequestsIds = (state: AppState) => getStatus(state).runningRequests.allIds;
export const getRunningRequest = (state: AppState, id: string) => getStatus(state).runningRequests.byId[id];