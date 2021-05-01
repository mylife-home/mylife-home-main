import React, { FunctionComponent, useCallback, useLayoutEffect, MutableRefObject } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import { makeStyles } from '@material-ui/core/styles';

import { Konva } from '../drawing/konva';
import { useViewInfo } from '../drawing/view-info';
import BaseCanvas from '../drawing/canvas';
import { useZoom, usePosition } from '../drawing/viewport-manips';
import { useDroppable } from '../component-creation-dnd';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    width: '100%',
  }
}), { name: 'main-view-canvas' });

const Canvas: FunctionComponent<{ stageRef: MutableRefObject<Konva.Stage> }> = ({ stageRef, children }) => {
  const classes = useStyles();
  const ref = useDroppable(stageRef.current);
  const { viewInfo } = useViewInfo();

  useStageContainerSize(stageRef);

  const wheelHandler = useWheelHandler(stageRef);
  const dragMoveHander = useDragMoveHandler();

  const { x, y, scale } = viewInfo.viewport;
  const { width, height } = viewInfo.container;

  return (
    <div className={classes.container} ref={ref}>
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
    </div>
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
