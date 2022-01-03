import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store/types';
import { useTabPanelId } from './tab-panel';

export function useTabSelector<TValue>(selector: (state: AppState, tabId: string) => TValue) {
  const tabId = useTabPanelId();
  return useSelector(useCallback((state: AppState) => selector(state, tabId), [selector, tabId]));
}
