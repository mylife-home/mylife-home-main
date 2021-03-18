import React, { FunctionComponent, Children } from 'react';

import { useCanvasTheme } from '../../drawing/theme';
import Typography from '../../drawing/typography';
import Border from '../../drawing/border';
import Icon, { Image } from '../../drawing/icon';

export const Title: FunctionComponent<{ text: string; }> = ({ text }) => {
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

interface PropertyProps {
  yIndex: number;
  icon: Image;
  primary: string;
  secondary?: string;
}

export const Property: FunctionComponent<PropertyProps> = ({ yIndex, icon, primary, secondary }) => {
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

export const BorderGroup: FunctionComponent<{ yIndex: number; }> = ({ yIndex, children }) =>  {
  const theme = useCanvasTheme();

  const childrenCount = Children.count(children);

  return (
    <>
      <Border x={0} y={(theme.component.boxHeight * yIndex) - 1} width={theme.component.width} height={theme.component.boxHeight * childrenCount + 1} color={theme.borderColor} type='inner' />
      {children}
    </>
  );
};