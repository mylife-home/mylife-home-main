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
      x={viewInfo.x / viewInfo.scale}
      y={viewInfo.y / viewInfo.scale}
      width={Math.min(viewInfo.width / viewInfo.scale, theme.layerSize)}
      height={Math.min(viewInfo.height / viewInfo.scale, theme.layerSize)}
      stroke={theme.borderColorSelected}
      strokeWidth={scale > 0 ? 1 / scale : 1}
    />
  );
};

export default MainViewMark;
