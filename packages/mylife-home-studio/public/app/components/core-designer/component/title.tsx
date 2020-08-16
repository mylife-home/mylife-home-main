import React, { FunctionComponent } from 'react';
import { Rect } from 'react-konva';

import { useCanvasTheme } from '../base/theme';
import Typography from '../base/typography';

export interface TitleProps {
  text: string;
}

const Title: FunctionComponent<TitleProps> = ({ text }) => {
  const theme = useCanvasTheme();
  
  return (
    <Typography x={theme.component.paddingLeft } y={0} width={theme.component.width} height={theme.gridStep} text={text} bold />
  );
};

export default Title;
