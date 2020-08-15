import React, { FunctionComponent, Fragment } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Text } from 'react-konva';

interface TypographyProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  bold?: boolean;
  color: string;
}

const Typography: FunctionComponent<TypographyProps> = ({ bold, color, ...props }) => {
  const theme = useTheme();
  const { fontFamily } = theme.typography;
  return (
    <Text {...props} fill={color} fontFamily={fontFamily} fontSize={GRID_STEP * 0.6} fontStyle={bold && 'bold'} verticalAlign={'middle'} />
  );
};

export default Typography;