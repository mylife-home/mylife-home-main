import { useSelector } from 'react-redux';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useSelection } from '../../selection';
import { AppState } from '../../../../store/types';
import { getComponent, getPlugin } from '../../../../store/core-designer/selectors';

export function useComponentData() {
  const tabId = useTabPanelId();
  const { selection } = useSelection();
  const component = useSelector((state: AppState) => getComponent(state, tabId, selection.id));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}
