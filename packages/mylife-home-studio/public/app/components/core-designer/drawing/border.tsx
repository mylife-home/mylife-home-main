import React, { FunctionComponent } from 'react';

import { Rect } from './konva';
import { Rectangle } from './types';

type BorderType = 'inner' | 'outer';

export interface BorderProps extends Rectangle {
  thickness?: number;
  type: BorderType;
  color: string;
}

const Border: FunctionComponent<BorderProps> = ({ x, y, height, width, thickness = 1, type, color }) => {
  const rect = buildRect({ x, y, height, width }, thickness, type);

  return (
    <Rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} stroke={color} strokeWidth={thickness} listening={false} />
  );
};

export default Border;

function buildRect({ x, y, height, width }: Rectangle, thickness: number, type: BorderType) {
  switch (type) {
    case 'outer':
      return {
        x: x - thickness / 2,
        y: y - thickness / 2,
        height: height + thickness,
        width: width + thickness,
      };

    case 'inner':
      return {
        x: x + thickness / 2,
        y: y + thickness / 2,
        height: height - thickness,
        width: width - thickness,
      };
  }
}