import React, { FunctionComponent, useRef, useCallback, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import { Konva } from '../drawing/konva';
import { useViewInfo } from '../drawing/view-info';
import BaseCanvas from '../drawing/canvas';
import { useZoom, usePosition } from '../drawing/viewport-manips';

const Canvas: FunctionComponent = ({ children }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const { viewInfo } = useViewInfo();

  useStageContainerSize(stageRef);

  const wheelHandler = useWheelHandler(stageRef);
  const dragMoveHander = useDragMoveHandler();

  const { x, y, scale } = viewInfo.viewport;
  const { width, height } = viewInfo.container;

  return (
    <BaseCanvas
      ref={stageRef}
      x={-x * scale}
      y={-y * scale}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      draggable
      onWheel={wheelHandler}
      onDragMove={dragMoveHander}
    >
      {children}
    </BaseCanvas>
    );
};

export default Canvas;

function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>) {
  const { setViewContainer } = useViewInfo();

  useLayoutEffect(() => {
    if(stageRef.current) {
      setViewContainer(stageRef.current.container().getBoundingClientRect());
    }
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setViewContainer({ width: entry.contentRect.width, height: entry.contentRect.height }));
}

function useDragMoveHandler() {
  const { setContainerPosition } = usePosition();

  return useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if(!(e.target instanceof Konva.Stage)) {
      return;
    }

    const stage = e.target;
    setContainerPosition({ x: -stage.x(), y: -stage.y() });
  }, [setContainerPosition]);
}

function useWheelHandler(stageRef: React.MutableRefObject<Konva.Stage>) {
  const { wheelZoom } = useZoom();

  return useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    wheelZoom(pointer, e.evt.deltaY);
  }, [stageRef.current, wheelZoom]);
}
