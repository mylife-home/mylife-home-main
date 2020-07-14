import { AppState } from '../types';

const getRegistry = (state: AppState) => state.registry;
export const getComponentState = (state: AppState, componentId: string, stateName: string) => getRegistry(state)?.[componentId]?.[stateName];