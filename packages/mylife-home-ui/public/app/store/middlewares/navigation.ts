import { Middleware } from 'redux';
import { viewNavigationChange } from '../actions/view';
import { NAVIGATION_PUSH } from '../types/navigation';

export const navigationMiddleware: Middleware = (store) => (next) => {

  const onHashChanged = () => {
    const { hash } = window.location;
    const viewId = hash && hash.substr(1);
    if (viewId) {
      next(viewNavigationChange(viewId));
    }
  };

  window.onhashchange = onHashChanged;
  onHashChanged();

  return (action) => {

    if (action.type === NAVIGATION_PUSH) {
      window.location.hash = action.payload;
    }

    return next(action);
  };
};
