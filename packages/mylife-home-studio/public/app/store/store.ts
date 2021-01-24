import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { asyncActionMiddleware } from './common/async-action';

import rootEpic from './epics';
import reducer from './reducer';

const epicMiddleware = createEpicMiddleware();

const middlewares = [asyncActionMiddleware, epicMiddleware];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger());
}

export const store = createStore(reducer, applyMiddleware(...middlewares));

epicMiddleware.run(rootEpic);
