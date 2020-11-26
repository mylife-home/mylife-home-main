import { ActionCreatorsMapObject, ActionCreator, bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { useMemo } from 'react';

export function useAction<A, C extends ActionCreator<A>>(action: C): C {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators(action, dispatch),
    [dispatch]
  );
}

export function useActions<A, M extends ActionCreatorsMapObject<A>>(actions: M): M {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators(actions, dispatch),
    [dispatch]
  );
}
