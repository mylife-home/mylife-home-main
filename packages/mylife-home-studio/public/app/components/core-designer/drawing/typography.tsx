import React, { FunctionComponent } from 'react';
import { useCanvasTheme } from './theme';
import { Text } from './konva';

interface TypographyProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  italic?: boolean;
  bold?: boolean;
  color?: string;
}

const Typography: FunctionComponent<TypographyProps> = ({ bold, italic, color, ...props }) => {
  const theme = useCanvasTheme();
  return (
    <Text ellipsis wrap='none' fill={color || theme.color} fontFamily={theme.fontFamily} fontSize={theme.fontSize} fontStyle={getFontStyle({ bold, italic })} verticalAlign={'middle'} {...props} />
  );
};

export default Typography;

function getFontStyle({ bold = false, italic = false }: { bold?: boolean; italic?: boolean }) {
  if (bold) {
    return 'bold';
  } else if (italic) {
    return 'italic';
  } else {
    return 'normal';
  }
}
