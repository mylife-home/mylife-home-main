import React, { FunctionComponent, useRef, useState, useLayoutEffect } from 'react';
import Konva from 'konva';
import { Layer } from 'react-konva';
import useResizeObserver from '@react-hook/resize-observer';
import BaseCanvas from '../base/canvas';

export interface CanvasProps {
  size: number;
  scale: number;
  onSizeChange: (size: number) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ size, scale, onSizeChange, children }) => {
  const stageRef = useRef<Konva.Stage>(null);
  useStageContainerSize(stageRef, onSizeChange);

  return (
    <BaseCanvas ref={stageRef} width={size} height={size} scaleX={scale} scaleY={scale}>
      <Layer>
        {children}
      </Layer>
    </BaseCanvas>
  );
};

export default Canvas;

export function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>, setSize: (size: number) => void) {
  useLayoutEffect(() => {
    if(stageRef.current) {
      setSize(computeSize(stageRef.current.container().getBoundingClientRect()));
    }
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setSize(computeSize({ width: entry.contentRect.width, height: entry.contentRect.height })));
}

function computeSize(size: { width: number; height: number}) {
  // mini view is square
  return Math.min(size.width, size.height);
}