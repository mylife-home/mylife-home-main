import React, { FunctionComponent } from 'react';

import { useComponentSelection } from '../selection';
import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect } from '../drawing/shapes';
import { useComponentData } from '../component-move';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const theme = useCanvasTheme();

  const { component, plugin } = useComponentData(componentId);
  const { selected } = useComponentSelection(componentId);
  const rect = computeComponentRect(theme, component, plugin);
  const componentColor = component.external ? theme.borderColorExternal : theme.borderColor;

  return (
    <Rect
      {...rect}
      fill={selected ? theme.borderColorSelected : componentColor}
    />
  );
};

export default Component;
