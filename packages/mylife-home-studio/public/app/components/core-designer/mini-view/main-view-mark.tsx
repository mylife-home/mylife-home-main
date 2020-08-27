import React, { FunctionComponent } from 'react';

import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { useViewInfo } from '../drawing/view-info';

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
