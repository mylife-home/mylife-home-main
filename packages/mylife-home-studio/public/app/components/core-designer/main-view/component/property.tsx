import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../../drawing/theme';
import Icon, { Image } from '../../drawing/icon';
import Typography from '../../drawing/typography';

export interface PropertyProps {
  yIndex: number;
  icon: Image;
  primary: string;
  secondary?: string;
}

const Property: FunctionComponent<PropertyProps> = ({ yIndex, icon, primary, secondary }) => {
  const theme = useCanvasTheme();

  const xBase = theme.component.paddingLeft;
  const yBase = theme.component.boxHeight * yIndex;
  const xPrimary = xBase + theme.component.boxHeight; // icons are square
  const xSecondary = theme.component.width - theme.component.secondaryWidth - theme.component.paddingLeft;

  return (
    <>
      <Icon x={xBase} y={yBase + ((theme.component.boxHeight - (theme.fontSize)) / 2)} size={theme.fontSize} image={icon} />
      <Typography x={xPrimary} y={yBase} height={theme.component.boxHeight} width={xSecondary - xPrimary - theme.component.paddingLeft} text={primary} />
      {secondary && (
        <Typography x={xSecondary} y={yBase} height={theme.component.boxHeight} width={theme.component.secondaryWidth} text={secondary} italic />
      )}
    </>
  );
};

export default Property;
