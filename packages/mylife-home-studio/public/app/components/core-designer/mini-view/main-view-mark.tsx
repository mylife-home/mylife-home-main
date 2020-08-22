import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';
import { useCanvasTheme } from '../base/theme';
import { useViewInfo } from '../base/view-info';

export interface MainViewMarkProps {
  scale: number;
}

const MainViewMark: FunctionComponent<MainViewMarkProps> = ({ scale }) => {
  const theme = useCanvasTheme();
  const [viewInfo] = useViewInfo();

  return (
    <Rect
      x={viewInfo.x}
      y={viewInfo.y}
      width={viewInfo.width}
      height={viewInfo.height}
      stroke={theme.borderColorSelected}
      strokeWidth={scale > 0 ? 1 / scale : 1}
    />
  );
};

export default MainViewMark;
