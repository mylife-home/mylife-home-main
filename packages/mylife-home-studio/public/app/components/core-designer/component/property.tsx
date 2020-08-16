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
  const yBase = theme.gridStep * yIndex;
  const xTypo = xBase + theme.gridStep;

  return (
    <>
      <Icon x={xBase} y={yBase + ((theme.gridStep - (theme.fontSize)) / 2)} size={theme.fontSize} image={icon} />
      <Typography x={xTypo} y={yBase} height={theme.gridStep} width={theme.component.width - xTypo} text={text} />
    </>
  );
};

export default Property;
