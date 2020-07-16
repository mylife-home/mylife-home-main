import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { socketMiddleware } from './middlewares/socket';
import { resourcesMiddleware } from './middlewares/resources';
import { navigationMiddleware } from './middlewares/navigation';
import { createViewportMiddleware } from './middlewares/viewport';
import reducer from './reducers/index';

const middlewares = [createViewportMiddleware(), navigationMiddleware, socketMiddleware, resourcesMiddleware, thunk];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

export const store = createStore(reducer, applyMiddleware(...middlewares));
