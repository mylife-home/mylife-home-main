import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';

import { store } from '../../store/store';

const StoreProvider: FunctionComponent = (props) => (
  <Provider {...props} store={store} />
);

export default StoreProvider;
