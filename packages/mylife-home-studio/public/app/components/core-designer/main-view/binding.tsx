import React, { FunctionComponent, useMemo } from 'react';

import { useTabPanelId } from '../../lib/tab-panel';
import { useBindingSelection } from '../selection';
import { Arrow } from '../drawing/konva';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSafeSelector } from '../drawing/use-safe-selector';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getPlugin, getBinding } from '../../../store/core-designer/selectors';

export interface BindingProps {
  bindingId: string;
}

const Binding: FunctionComponent<BindingProps> = ({ bindingId }) => {
  const { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin } = useConnect(bindingId);
  const { sourceAnchor, targetAnchor } = useAnchors(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);
  const theme = useCanvasTheme();
  const { selected, select } = useBindingSelection(bindingId);

  const color = selected ? theme.borderColorSelected : theme.color;

  return (
    <Arrow
      fill={color}
      stroke={color}
      points={[sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y]}
      onMouseDown={select}
      pointerLength={theme.binding.pointerLength}
      pointerWidth={theme.binding.pointerWidth}
      strokeWidth={theme.binding.strokeWidth}
      hitStrokeWidth={GRID_STEP_SIZE}
    />
  );
};

export default Binding;

function useAnchors(binding: types.Binding, sourceComponent: types.Component, sourcePlugin: types.Plugin, targetComponent: types.Component, targetPlugin: types.Plugin) {
  const theme = useCanvasTheme();

  return useMemo(
    () => computeBindingAnchors(theme, binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin),
    [
      theme,
      sourceComponent.position.x,
      sourceComponent.position.y,
      targetComponent.position.x,
      targetComponent.position.y,
      sourceComponent.id,
      targetComponent.id,
      binding.sourceState,
      binding.targetAction
    ]
  );
}

function useConnect(bindingId: string) {
  const tabId = useTabPanelId();
  const binding = useSafeSelector((state: AppState) => getBinding(state, tabId, bindingId));
  const sourceComponent = useSafeSelector((state: AppState) => getComponent(state, tabId, binding.sourceComponent));
  const targetComponent = useSafeSelector((state: AppState) => getComponent(state, tabId, binding.targetComponent));
  const sourcePlugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, sourceComponent.plugin));
  const targetPlugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, targetComponent.plugin));
  return { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin };
}
