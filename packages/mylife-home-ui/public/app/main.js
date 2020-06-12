'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import { middlewares } from 'mylife-home-ui-common';

import navigationMiddleware from './middlewares/navigation';
import viewportMiddleware from './middlewares/viewport';
import reducer from './reducers/index';

import Application from './components/application';
import Bootstrap from './components/bootstrap';
import View from './containers/view';

import { viewInit } from './actions/view';

import /*css from*/ '../app.less';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const store = createStore(
  reducer,
  applyMiddleware(viewportMiddleware, navigationMiddleware, middlewares.socket, middlewares.resources, routerMiddleware(hashHistory), thunk, createLogger())
);

const history = syncHistoryWithStore(hashHistory, store);

store.dispatch(viewInit());

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
        <Route path="/" component={Application}>
          <IndexRoute component={Bootstrap} />
          <Route path=":window" component={View} />
        </Route>
      </Router>
  </Provider>,
  document.getElementById('content')
);
