import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../base/theme';
import Icon, { Image } from '../base/icon';
import Typography from '../base/typography';

export interface PropertyProps {
  yIndex: number;
  icon: Image;
  text: string;
}

const Property: FunctionComponent<PropertyProps> = ({ yIndex, icon, text }) => {
  const theme = useCanvasTheme();

  const xBase = theme.component.paddingLeft;
  const yBase = theme.component.boxHeight * yIndex;
  const xTypo = xBase + theme.component.boxHeight; // icons are square

  return (
    <>
      <Icon x={xBase} y={yBase + ((theme.component.boxHeight - (theme.fontSize)) / 2)} size={theme.fontSize} image={icon} />
      <Typography x={xTypo} y={yBase} height={theme.component.boxHeight} width={theme.component.width - xTypo} text={text} />
    </>
  );
};

export default Property;
