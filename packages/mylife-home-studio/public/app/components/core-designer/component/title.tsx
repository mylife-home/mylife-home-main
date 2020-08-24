import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../base/theme';
import Typography from '../base/typography';
import Border from '../base/border';

export interface TitleProps {
  text: string;
}

const Title: FunctionComponent<TitleProps> = ({ text }) => {
  const theme = useCanvasTheme();

  const width = theme.component.width;
  const height = theme.component.boxHeight;
  
  return (
    <>
      <Typography x={theme.component.paddingLeft } y={0} width={width} height={height} text={text} bold />
      <Border x={0} y={0} width={width} height={height} color={theme.borderColor} type='inner' />
    </>
  );
};

export default Title;
