import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';

const middlewares = [thunk];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

export const store = createStore(reducer, applyMiddleware(...middlewares));
