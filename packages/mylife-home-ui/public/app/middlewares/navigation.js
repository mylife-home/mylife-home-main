'use strict';

import { viewNavigationChange } from '../actions/view';

const middleware = (/*store*/) => next => action => {
  next(action);

  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      let { pathname } = action.payload;
      pathname = pathname.substr(1);
      return pathname && next(viewNavigationChange(pathname));
    }
  }
};

export default middleware;
