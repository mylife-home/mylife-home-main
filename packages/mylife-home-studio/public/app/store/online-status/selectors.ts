import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';

const getOnlineStatus = (state: AppState) => state.onlineStatus;
export const getNotifierId = (state: AppState) => getOnlineStatus(state).notifierId;
const getStatus = (state: AppState) => getOnlineStatus(state).status;

export const isTransportConnected = (state: AppState) => !!getStatus(state).transportConnected;
