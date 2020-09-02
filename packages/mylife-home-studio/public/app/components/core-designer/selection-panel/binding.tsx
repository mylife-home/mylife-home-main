import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { useTabPanelId } from '../../lib/tab-panel';
import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getPlugin, getBinding } from '../../../store/core-designer/selectors';

const Binding: FunctionComponent = () => {
  const { selection, select } = useSelection();
  const { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin } = useConnect(selection.id);
  const componentBindingPosition = useCenterBinding(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);

  const handleSelectSource = () => select({ type: 'component', id: binding.sourceComponent });
  const handleSelectTarget = () => select({ type: 'component', id: binding.targetComponent });

  return (
    <div>
      <CenterButton position={componentBindingPosition} />
      <Button onClick={handleSelectSource}>{binding.sourceComponent}</Button>
      <Typography>{binding.sourceState}</Typography>
      <Button onClick={handleSelectTarget}>{binding.targetComponent}</Button>
      <Typography>{binding.targetAction}</Typography>
    </div>
  );
};

export default Binding;

function useConnect(bindingId: string) {
  const tabId = useTabPanelId();
  const binding = useSelector((state: AppState) => getBinding(state, tabId, bindingId));
  const sourceComponent = useSelector((state: AppState) => getComponent(state, tabId, binding.sourceComponent));
  const targetComponent = useSelector((state: AppState) => getComponent(state, tabId, binding.targetComponent));
  const sourcePlugin = useSelector((state: AppState) => getPlugin(state, tabId, sourceComponent.plugin));
  const targetPlugin = useSelector((state: AppState) => getPlugin(state, tabId, targetComponent.plugin));
  return { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin };
}

function useCenterBinding(binding: types.Binding, sourceComponent: types.Component, sourcePlugin: types.Plugin, targetComponent: types.Component, targetPlugin: types.Plugin) {
  const theme = useCanvasTheme();

  return useMemo(() => {
    const { sourceAnchor, targetAnchor } = computeBindingAnchors(theme, binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);
    return computeCenter(sourceAnchor, targetAnchor);
  }, [theme, binding, sourceComponent, targetComponent]);
}

function computeCenter(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}
