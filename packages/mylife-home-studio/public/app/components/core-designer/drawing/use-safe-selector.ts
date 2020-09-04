import { useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/types';

// to be remove when useSelector is fixed inside react-konva components
// https://kaihao.dev/posts/Stale-props-and-zombie-children-in-Redux
// https://medium.com/swlh/using-the-react-redux-hooks-api-to-manipulate-store-state-664d7cf27521

const unset = Symbol('unset');

export function useSafeSelector<TSelected = unknown>(selector: (state: AppState) => TSelected) {
  const valueRef = useRef<TSelected | Symbol>(unset);

  const safeSelector = useCallback((state: AppState) => {
    try {
      const value = selector(state);
      valueRef.current = value;
      return value;
    } catch (err) {
      if (valueRef.current === unset) {
        throw err;
      }
  
      // in case of failure (because the data has been deleted in the store, but the component is not unmounted)
      // we return the old value
      // console.log('Error trapped by useSafeSelector, will return old value', err);
      return valueRef.current as TSelected;
    }
  }, [selector, valueRef]);

  return useSelector(safeSelector);
}