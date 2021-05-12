import { AppState } from '../types';

const getGit = (state: AppState) => state.git;
export const getNotifierId = (state: AppState) => getGit(state).notifierId;
const getStatus = (state: AppState) => getGit(state).status;
// TODO: finer selectors