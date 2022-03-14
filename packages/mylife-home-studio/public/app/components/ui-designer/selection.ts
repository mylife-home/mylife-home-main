import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTabPanelId } from '../lib/tab-panel';

import { AppState } from '../../store/types';
import { Selection } from '../../store/ui-designer/types';
import { getSelection } from '../../store/ui-designer/selectors';
import { select } from '../../store/ui-designer/actions';

export function useSelection() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return {
    selection: useSelector((state: AppState) => getSelection(state, tabId)),
    select: useCallback((selection: Selection) => {
      dispatch(select({ id: tabId, selection }));
    }, [tabId, dispatch])
  };
}

export function useResetSelectionIfNull<T>(obj: T) {
  const { select } = useSelection();

  useEffect(() => {
    if (!obj) {
      select({ type: 'project' });
    }
  }, [obj]);
}
