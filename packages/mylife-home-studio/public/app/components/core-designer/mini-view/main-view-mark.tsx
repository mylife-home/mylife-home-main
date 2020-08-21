import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';
import { useCanvasTheme } from '../base/theme';

export interface MainViewMarkProps {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

const MainViewMark: FunctionComponent<MainViewMarkProps> = ({ x, y, width, height, scale }) => {
  const theme = useCanvasTheme();

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      stroke={theme.borderColorSelected}
      strokeWidth={1 / scale}
    />
  );
};

export default MainViewMark;
