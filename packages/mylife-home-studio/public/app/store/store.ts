import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { socketMiddleware } from './middlewares/socket';
import reducer from './reducer';

const middlewares = [socketMiddleware, thunk];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

export const store = createStore(reducer, applyMiddleware(...middlewares));
