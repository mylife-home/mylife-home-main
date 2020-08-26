import React, { FunctionComponent, useRef, useLayoutEffect, useCallback } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { Konva, Layer } from '../base/konva';
import BaseCanvas from '../base/canvas';

export interface CanvasProps {
  size: number;
  scale: number;
  onSizeChange: (size: number) => void;
  onClick: (pos: Konva.Vector2d) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ size, scale, onSizeChange, onClick, children }) => {
  const stageRef = useRef<Konva.Stage>(null);
  useStageContainerSize(stageRef, onSizeChange);
  const mouseMoveHandler = useMouseHandler(stageRef, onClick);

  return (
    <BaseCanvas ref={stageRef} width={size} height={size} scaleX={scale} scaleY={scale} onMousemove={mouseMoveHandler}>
      <Layer>
        {children}
      </Layer>
    </BaseCanvas>
  );
};

export default Canvas;

function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>, setSize: (size: number) => void) {
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

function useMouseHandler(stageRef: React.MutableRefObject<Konva.Stage>, onClick: (pos: Konva.Vector2d) => void) {
  return useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const LEFT_BUTTON = 1;
    if (e.evt.buttons !== LEFT_BUTTON) {
      return;
    }

    onClick(stageRef.current.getPointerPosition());
  }, [stageRef.current, onClick]);
}