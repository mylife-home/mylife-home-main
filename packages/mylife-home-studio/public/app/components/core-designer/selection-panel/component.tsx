import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';

import { useTabPanelId } from '../../lib/tab-panel';
import { useCanvasTheme } from '../drawing/theme';
import { Rectangle } from '../drawing/types';
import { computeComponentRect } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selection, select } = useSelection();
  const { component, plugin } = useConnect(selection.id);
  const componentCenterPosition = useCenterComponent(component, plugin);
  return (
    <div className={className}>
      <CenterButton position={componentCenterPosition} />
      <Typography>Selection {component.id}</Typography>
    </div>
  );
};

export default Component;

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
}

function useCenterComponent(component: types.Component, plugin: types.Plugin) {
  const theme = useCanvasTheme();
  return useMemo(() => {
    const rect = computeComponentRect(theme, component, plugin);
    return computeCenter(rect);
  }, [theme, component]);
}

function computeCenter(rect: Rectangle) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}