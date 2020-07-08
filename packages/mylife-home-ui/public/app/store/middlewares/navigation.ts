import { Middleware } from 'redux';
import { createHashHistory, Location } from 'history';
import { viewNavigationChange } from '../actions/view';
import { NAVIGATION_PUSH } from '../types/navigation';

export const navigationMiddleware: Middleware = (store) => (next) => {
  const history = createHashHistory();

  const onLocationChanged = (location: Location) => {
    const pathname = location.pathname;
    const viewId = pathname.substr(1);
    if (viewId) {
      next(viewNavigationChange(viewId));
    }
  };

  history.listen(onLocationChanged);
  onLocationChanged(history.location);

  return (action) => {
    switch (action.type) {
      case NAVIGATION_PUSH: {
        history.push(action.payload);
        break;
      }
    }

    return next(action);
  };
};
