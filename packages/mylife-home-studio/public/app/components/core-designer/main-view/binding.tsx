import React, { FunctionComponent, useMemo, useCallback } from 'react';

import { useTabPanelId } from '../../lib/tab-panel';
import { useBindingSelection } from '../selection';
import { Arrow } from '../drawing/konva';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSafeSelector } from '../drawing/use-safe-selector';
import { useViewPortVisibility } from '../drawing/viewport-manips';
import { useMovableComponent } from '../component-move';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getBinding } from '../../../store/core-designer/selectors';

export interface BindingProps {
  bindingId: string;
}

const Binding: FunctionComponent<BindingProps> = ({ bindingId }) => {
  const { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin } = useConnect(bindingId);
  const { sourceAnchor, targetAnchor } = useAnchors(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);
  const theme = useCanvasTheme();
  const { selected, select } = useBindingSelection(bindingId);
  const { isLineVisible } = useViewPortVisibility();
  const points = useMemo(() => [sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y], [sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y]);

  if (!isLineVisible(sourceAnchor, targetAnchor)) {
    return null;
  }

  const color = selected ? theme.borderColorSelected : theme.color;

  return (
    <Arrow
      fill={color}
      stroke={color}
      points={points}
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
  const binding = useSafeSelector(useCallback((state: AppState) => getBinding(state, tabId, bindingId), [bindingId]));
  const { component: sourceComponent, plugin: sourcePlugin } = useMovableComponent(binding.sourceComponent);
  const { component: targetComponent, plugin: targetPlugin } = useMovableComponent(binding.targetComponent);
  return { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin };
}
