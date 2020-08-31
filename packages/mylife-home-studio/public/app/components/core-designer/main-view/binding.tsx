import React, { FunctionComponent, useMemo } from 'react';

import { Arrow } from '../drawing/konva';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';

import * as schema from '../../../files/schema';

export interface BindingProps {
  binding: schema.Binding,
  sourceComponent: schema.Component;
  targetComponent: schema.Component;
  selected?: boolean;

  onSelect: () => void;
}

const Binding: FunctionComponent<BindingProps> = ({ sourceComponent, targetComponent, binding, selected, onSelect }) => {
  const { sourceAnchor, targetAnchor } = useAnchors(binding, sourceComponent, targetComponent);
  const theme = useCanvasTheme();

  const color = selected ? theme.borderColorSelected : theme.color;

  return (
    <Arrow
      fill={color}
      stroke={color}
      points={[sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y]}
      onMouseDown={onSelect}
      pointerLength={theme.binding.pointerLength}
      pointerWidth={theme.binding.pointerWidth}
      strokeWidth={theme.binding.strokeWidth}
      hitStrokeWidth={GRID_STEP_SIZE}
    />
  );
};

export default Binding;

function useAnchors(binding: schema.Binding, sourceComponent: schema.Component, targetComponent: schema.Component) {
  const theme = useCanvasTheme();

  return useMemo(
    () => computeBindingAnchors(theme, binding, sourceComponent, targetComponent),
    [theme, sourceComponent.x, sourceComponent.y, targetComponent.x, targetComponent.y, sourceComponent.id, targetComponent.id, binding.sourceState, binding.targetAction]
  );
}
