import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';
import { useCanvasTheme } from '../base/theme';
import { useViewInfo } from '../base/view-info';

export interface MainViewMarkProps {
  scale: number;
}

const MainViewMark: FunctionComponent<MainViewMarkProps> = ({ scale }) => {
  const theme = useCanvasTheme();
  const { viewInfo } = useViewInfo();
  const { viewport } = viewInfo;

  return (
    <Rect
      x={viewport.x}
      y={viewport.y}
      width={viewport.width}
      height={viewport.height}
      stroke={theme.borderColorSelected}
      strokeWidth={scale > 0 ? 1 / scale : 1}
    />
  );
};

export default MainViewMark;
