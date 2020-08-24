import React, { FunctionComponent, useRef, useCallback, useLayoutEffect, useContext } from 'react';
import Konva from 'konva';
import { Layer } from 'react-konva';
import useResizeObserver from '@react-hook/resize-observer';

import { LAYER_SIZE } from './base/defs';
import { useViewInfo } from './base/view-info';
import BaseCanvas from './base/canvas';
import { useZoom } from './base/zoom';

const Canvas: FunctionComponent = ({ children }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [viewInfo] = useViewInfo();

  useStageContainerSize(stageRef);

  const wheelHandler = useWheelHandler(stageRef);
  const dragBoundHandler = useDragBoundHandler();
  const dragMoveHander = useDragMoveHandler();

  return (
    <BaseCanvas
      ref={stageRef}
      x={-viewInfo.x}
      y={-viewInfo.y}
      width={viewInfo.width}
      height={viewInfo.height}
      scaleX={viewInfo.scale}
      scaleY={viewInfo.scale}
      draggable
      dragBoundFunc={dragBoundHandler}
      onWheel={wheelHandler}
      onDragMove={dragMoveHander}
    >
      <Layer>
        {children}
      </Layer>
    </BaseCanvas>
    );
};

export default Canvas;

function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>) {
  const [, setViewInfo] = useViewInfo();

  const setSize = useCallback((size: { width: number; height: number}) => setViewInfo(viewInfo => ({ ...viewInfo, ...size })), [setViewInfo]);

  useLayoutEffect(() => {
    if(stageRef.current) {
      setSize(stageRef.current.container().getBoundingClientRect());
    }
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
}

function useDragBoundHandler() {
  const [viewInfo] = useViewInfo();

  return useCallback((pos: Konva.Vector2d) => ({
    x: lockBetween(pos.x, LAYER_SIZE - viewInfo.width / viewInfo.scale),
    y: lockBetween(pos.y, LAYER_SIZE - viewInfo.height / viewInfo.scale),
  }), [viewInfo]);
}

function useDragMoveHandler() {
  const [, setViewInfo] = useViewInfo();
  const setPos = useCallback((pos: { x: number, y: number }) => setViewInfo(viewInfo => ({ ...viewInfo, ...pos })), [setViewInfo]);

  return useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if(!(e.target instanceof Konva.Stage)) {
      return;
    }

    const stage = e.target;
    setPos({ x: -stage.x(), y: -stage.y() });
  }, [setViewInfo]);
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

function lockBetween(value: number, max: number) {
  if (value > 0) {
    return 0;
  }

  if (max < 0) {
    max = 0;
  }

  if (value <= -max) {
    return -max + 1;
  }
  
  return value;
}
