'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';

import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import { socketMiddleware } from './middlewares/socket';
import { resourcesMiddleware } from './middlewares/resources';
import { navigationMiddleware } from './middlewares/navigation';
import { createViewportMiddleware } from './middlewares/viewport';
import reducer from './reducers/index';

import Application from './components/application';
import Bootstrap from './components/bootstrap';
import View from './containers/view';

import { viewInit } from './actions/view';

import '../app.less';

const hashHistory = createHashHistory();

const store = createStore(
  reducer,
  applyMiddleware(createViewportMiddleware(), navigationMiddleware, socketMiddleware, resourcesMiddleware, routerMiddleware(hashHistory), thunk, createLogger())
);

const history = syncHistoryWithStore(hashHistory, store);

store.dispatch(viewInit());

ReactDOM.render(
  <Provider store={store}>
    <Application>
      <Router history={history}>
        <Route path="/" exact  component={Bootstrap} />
        <Route path="/:window" component={View} />
      </Router>
    </Application>
  </Provider>,
  document.getElementById('content')
);
