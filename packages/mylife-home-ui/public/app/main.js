'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import Application from './components/application';
import Bootstrap from './components/bootstrap';
import View from './containers/view';

import { viewInit } from './store/actions/view';

import '../app.less';

import { hashHistory, store } from './store/store';

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
