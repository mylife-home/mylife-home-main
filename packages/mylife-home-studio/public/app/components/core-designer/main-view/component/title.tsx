import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../../drawing/theme';
import Typography from '../../drawing/typography';
import Border from '../../drawing/border';

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
