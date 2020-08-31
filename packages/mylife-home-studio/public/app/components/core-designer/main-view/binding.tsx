import React, { FunctionComponent, useMemo } from 'react';

import { Arrow } from '../drawing/konva';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';

import * as schema from '../../../files/schema';

export interface BindingProps {
  sourceComponent: schema.Component;
  targetComponent: schema.Component;
  sourceState: string;
  targetAction: string;
  selected?: boolean;

  onSelect: () => void;
}

const Binding: FunctionComponent<BindingProps> = ({ sourceComponent, targetComponent, sourceState, targetAction, selected, onSelect }) => {
  const { sourceAnchor, targetAnchor } = useAnchors(sourceComponent, targetComponent, sourceState, targetAction);
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

function useAnchors(sourceComponent: schema.Component, targetComponent: schema.Component, sourceState: string, targetAction: string) {
  const theme = useCanvasTheme();

  return useMemo(
    () => computeBindingAnchors(theme, sourceComponent, targetComponent, sourceState, targetAction),
    [theme, sourceComponent.x, sourceComponent.y, targetComponent.x, targetComponent.y, sourceComponent.id, targetComponent.id, sourceState, targetAction]
  );
}
