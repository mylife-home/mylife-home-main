import React, { FunctionComponent } from 'react';
import { useCanvasTheme } from './theme';
import { Text } from './konva';

interface TypographyProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  bold?: boolean;
  color?: string;
}

const Typography: FunctionComponent<TypographyProps> = ({ bold, color, ...props }) => {
  const theme = useCanvasTheme();
  return (
    <Text {...props} fill={color || theme.color} fontFamily={theme.fontFamily} fontSize={theme.fontSize} fontStyle={bold && 'bold'} verticalAlign={'middle'} />
  );
};

export default Typography;