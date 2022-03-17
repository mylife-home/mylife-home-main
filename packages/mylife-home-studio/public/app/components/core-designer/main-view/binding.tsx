import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useSelectBinding } from '../selection';
import { Arrow } from '../drawing/konva';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { Point } from '../drawing/types';
import { useSafeSelector } from '../drawing/use-safe-selector';
import { useViewPortVisibility } from '../drawing/viewport-manips';
import { useComponentData } from '../component-move';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getBinding, getComponent, getPlugin, isComponentSelected, isBindingSelected } from '../../../store/core-designer/selectors';

export interface BindingProps {
  bindingId: string;
}

const Binding: FunctionComponent<BindingProps> = ({ bindingId }) => {
  const tabId = useTabPanelId();
  const binding = useSafeSelector(useCallback((state: AppState) => getBinding(state, bindingId), [bindingId]));
  const isSourceSelected = useSelector(useCallback((state: AppState) => isComponentSelected(state, tabId, binding.sourceComponent), [tabId, binding.sourceComponent]));
  const isTargetSelected = useSelector(useCallback((state: AppState) => isComponentSelected(state, tabId, binding.targetComponent), [tabId, binding.targetComponent]));
  const movable = isSourceSelected || isTargetSelected;

  return movable ? (
    <MovableBinding bindingId={bindingId} />
  ) : (
    <FixedBinding bindingId={bindingId} />
  );
};

export default Binding;

const MovableBinding: FunctionComponent<BindingProps> = ({ bindingId }) => {
  const binding = useSafeSelector(useCallback((state: AppState) => getBinding(state, bindingId), [bindingId]));
  const { component: sourceComponent, plugin: sourcePlugin } = useComponentData(binding.sourceComponent);
  const { component: targetComponent, plugin: targetPlugin } = useComponentData(binding.targetComponent);

  const { sourceAnchor, targetAnchor } = useAnchors(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);

  return (
    <BindingLayout bindingId={bindingId} sourceAnchor={sourceAnchor} targetAnchor={targetAnchor} />
  );
};

const FixedBinding: FunctionComponent<BindingProps> = ({ bindingId }) => {
  const binding = useSafeSelector(useCallback((state: AppState) => getBinding(state, bindingId), [bindingId]));
  const sourceComponent = useSafeSelector(useCallback((state: AppState) => getComponent(state, binding.sourceComponent), [binding.sourceComponent]));
  const sourcePlugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, sourceComponent.plugin), [sourceComponent.plugin]));
  const targetComponent = useSafeSelector(useCallback((state: AppState) => getComponent(state, binding.targetComponent), [binding.targetComponent]));
  const targetPlugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, targetComponent.plugin), [targetComponent.plugin]));

  const { sourceAnchor, targetAnchor } = useAnchors(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);

  return (
    <BindingLayout bindingId={bindingId} sourceAnchor={sourceAnchor} targetAnchor={targetAnchor} />
  );
};

const BindingLayout: FunctionComponent<{ bindingId: string; sourceAnchor: Point; targetAnchor: Point; }> = ({ bindingId, sourceAnchor, targetAnchor }) => {
  const theme = useCanvasTheme();
  const tabId = useTabPanelId();
  const { isLineVisible } = useViewPortVisibility();
  const selected = useSelector(useCallback((state: AppState) => isBindingSelected(state, tabId, bindingId), [tabId, bindingId]));
  const selectBinding = useSelectBinding();
  const select = useCallback(() => selectBinding(bindingId), [selectBinding, bindingId]);
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
