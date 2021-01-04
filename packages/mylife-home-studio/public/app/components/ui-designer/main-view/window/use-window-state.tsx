import React, { createContext, FunctionComponent, useCallback, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { useDebounced } from '../../../lib/use-debounced';
import { useTabPanelId } from '../../../lib/tab-panel';
import { setWindow } from '../../../../store/ui-designer/actions';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { UiWindow } from '../../../../store/ui-designer/types';

export type WindowUpdater = (props: Partial<UiWindow>) => void;

interface WindowContextProps {
  window: UiWindow;
  updater: WindowUpdater;
}

const WindowContext = createContext<WindowContextProps>(null);

export function useWindowState() {
  return useContext(WindowContext);
}

export const WindowStateProvider: FunctionComponent<{ id: string; }> = ({ id, children }) => {
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

  const context: WindowContextProps = useMemo(() => {
    const updater = (props: Partial<UiWindow>) => {
      componentChange((prev) => ({ ...prev, ...props }));
    };

    return { window: componentValue, updater };
  }, [componentValue, componentChange]);

  return (
    <WindowContext.Provider value={context}>
      {children}
    </WindowContext.Provider>
  );
};
