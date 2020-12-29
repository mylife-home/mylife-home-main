import { useSelector } from 'react-redux';
import { AppState } from '../../store/types';
import { useTabPanelId } from './tab-panel';

export function useTabSelector<TValue>(selector: (state: AppState, tabId: string) => TValue) {
  const tabId = useTabPanelId();
  return useSelector((state: AppState) => selector(state, tabId));
}
