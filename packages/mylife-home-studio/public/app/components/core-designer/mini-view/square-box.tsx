import React, { FunctionComponent, useRef, useState, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

export interface SquareBoxProps {
  className?: string;
  adjust: 'width' | 'height';
}

const SquareBox: FunctionComponent<SquareBoxProps> = ({ adjust, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);

  const dimensions: { height?: number; width?: number } = {};
  switch(adjust) {
    case 'height':
      dimensions.height = size.width;
      break;

    case 'width':
      dimensions.width = size.height;
      break;
  }

  return (
    <div ref={ref} style={dimensions} className={className}>
      {children}
    </div>
  );
};

export default SquareBox;

export interface Size {
  width: number;
  height: number;
}

const DEFAULT_SIZE: Size = { width: 0, height: 0 };

export function useSize(ref: React.MutableRefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
 
  useLayoutEffect(() => {
    setSize(ref.current?.getBoundingClientRect() || DEFAULT_SIZE);
  }, [ref.current]);
 
  useResizeObserver(ref.current, (entry) => setSize(entry.contentRect));

  return size;
}
