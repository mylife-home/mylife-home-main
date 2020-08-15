import React, { FunctionComponent } from 'react';
import { Path } from 'react-konva';
import { useCanvasTheme } from './theme';

const PATH_SIZE = 24;

export type Image = 'visibility' | 'input';

const images = {
  visibility: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  input: "M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z",
};

export interface IconProps {
  image: Image;
  x: number;
  y: number;
  size: number;
  color?: string;
}

const Icon: FunctionComponent<IconProps> = ({ image, x, y, size, color }) => {
  const theme = useCanvasTheme();

  return (
    <Path
      x={x}
      y={y}
      width={size}
      height={size}
      scaleX={size / PATH_SIZE}
      scaleY={size / PATH_SIZE}
      data={images[image]}
      fill={color || theme.color}
    />
  );
};

export default Icon;