import { useState, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import Konva from 'konva';

export interface Size {
  width: number;
  height: number;
}

const DEFAULT_SIZE: Size = { width: 0, height: 0 };

export function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>): Size {
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
 
  useLayoutEffect(() => {
    setSize(stageRef.current?.container().getBoundingClientRect() || DEFAULT_SIZE);
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setSize(entry.contentRect));

  return size;
}
