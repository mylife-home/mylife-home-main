'use strict';

import { Middleware, Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { viewNavigationChange } from '../actions/view';

// FIXME: real types
export const navigationMiddleware: Middleware = (store) => (next: ThunkDispatch<{}, {}, Action>) => (action) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      let { pathname } = action.payload;
      pathname = pathname.substr(1);
      if (pathname) {
        next(viewNavigationChange(pathname));
      }
    }
  }

  return next(action);
};
