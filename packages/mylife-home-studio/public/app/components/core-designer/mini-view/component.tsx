import React, { FunctionComponent } from 'react';

import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect } from '../drawing/shapes';

import * as schema from '../../../files/schema';

export interface ComponentProps {
  component: schema.Component,
  selected?: boolean;
}

const Component: FunctionComponent<ComponentProps> = ({ component, selected }) => {
  const theme = useCanvasTheme();
  const rect = computeComponentRect(theme, component);

  return (
    <Rect
      {...rect}
      fill={selected ? theme.borderColorSelected : theme.borderColor}
    />
  );
};

export default Component;
