import { Status } from '../../../../shared/online';

export const enum ActionTypes {
  SET_NOTIFICATION = 'online-status/set-notification',
  CLEAR_NOTIFICATION = 'online-status/clear-notification',
  SET_STATUS = 'online-status/set-status'
}

export { Status };

export interface OnlineStatusState {
  notifierId: string;
  status: Status;
}