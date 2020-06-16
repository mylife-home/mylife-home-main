import { Middleware } from 'redux';
import { viewNavigationChange } from '../actions/view';
import { AppThunkDispatch } from '../types';

export const navigationMiddleware: Middleware = (store) => (next: AppThunkDispatch) => (action) => {
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
