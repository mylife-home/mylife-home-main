import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Application from './components/application';
import View from './containers/view';

import '../app.less';

import { store } from './store/store';

ReactDOM.render(
  <Provider store={store}>
    <Application>
      <View />
    </Application>
  </Provider>,
  document.getElementById('content')
);
