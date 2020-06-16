import { createHashHistory } from 'history';

import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';

import { socketMiddleware } from './middlewares/socket';
import { resourcesMiddleware } from './middlewares/resources';
import { navigationMiddleware } from './middlewares/navigation';
import { createViewportMiddleware } from './middlewares/viewport';
import reducer from './reducers/index';

export const hashHistory = createHashHistory();

export const store = createStore(
  reducer,
  applyMiddleware(createViewportMiddleware(), navigationMiddleware, socketMiddleware, resourcesMiddleware, routerMiddleware(hashHistory), thunk, createLogger())
);
