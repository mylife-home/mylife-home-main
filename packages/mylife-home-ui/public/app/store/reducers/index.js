'use strict';

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import online from './online';
import repository from './repository';
import resources from './resources';
import view from './view';
import windows from './windows';

export default combineReducers({
  online,
  repository,
  resources,
  view,
  windows,
  routing: routerReducer
});
