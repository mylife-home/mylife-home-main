import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { useDebounced } from '../../../lib/use-debounced';
import { useTabPanelId } from '../../../lib/tab-panel';
import { setWindow } from '../../../../store/ui-designer/actions';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { UiWindow } from '../../../../store/ui-designer/types';

export function useWindowState(id: string) {
  const tabId = useTabPanelId();
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));
  const dispatch = useDispatch();
  const persistWindow = useCallback(
    (window: UiWindow) => {
      dispatch(setWindow({ id: tabId, window }));
    },
    [dispatch]
  );

  const { componentValue, componentChange } = useDebounced(window, persistWindow);

  const updater = useCallback((props: Partial<UiWindow>) => {
    componentChange((prev) => ({ ...prev, ...props }));
  }, [componentChange]);

  return { window: componentValue, updater };
};
