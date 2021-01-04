import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { useDebounced } from '../../../lib/use-debounced';
import { useTabPanelId } from '../../../lib/tab-panel';
import { setControl } from '../../../../store/ui-designer/actions';
import { getControl } from '../../../../store/ui-designer/selectors';
import { UiControl } from '../../../../store/ui-designer/types';

export function useControlState(id: string) {
  const tabId = useTabPanelId();
  const control = useTabSelector((state, tabId) => getControl(state, tabId, id));
  const dispatch = useDispatch();
  const persistControl = useCallback(
    (control: UiControl) => {
      dispatch(setControl({ id: tabId, control }));
    },
    [dispatch]
  );

  const { componentValue, componentChange } = useDebounced(control, persistControl);

  const updater = useCallback((props: Partial<UiControl>) => {
    componentChange((prev) => ({ ...prev, ...props }));
  }, [componentChange]);

  return { control: componentValue, updater };
};
