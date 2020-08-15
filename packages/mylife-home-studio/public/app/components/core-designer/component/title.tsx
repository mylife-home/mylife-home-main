import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';

import { useCanvasTheme } from '../base/theme';
import Typography from '../base/typography';

export interface TitleProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
}

const Title: FunctionComponent<TitleProps> = ({x, y, height, width, text }) => {
  const theme = useCanvasTheme();
  
  return (
    <>
      <Rect x={x} y={y} width={width} height={height} fill={theme.backgroundColor} />
      <Typography x={x + theme.component.paddingLeft } y={y} width={width} height={height} text={text} bold />
    </>
  );
};

export default Title;
