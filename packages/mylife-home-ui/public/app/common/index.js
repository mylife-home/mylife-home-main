'use strict';

import * as actions from './actions';
import * as constants from './constants';
import * as selectors from './selectors';
import * as reducers from './reducers';

import resources from './middlewares/resources';
import socket from './middlewares/socket';
import InputManager from './utils/input-manager';
import { setupLocation } from './utils/location';

export {
  actions,
  constants,
  selectors,
  reducers
};

export const middlewares = { resources, socket };
export const utils       = { InputManager, setupLocation };
