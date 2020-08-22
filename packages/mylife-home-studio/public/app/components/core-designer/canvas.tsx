import React, { FunctionComponent, useRef, useCallback, useLayoutEffect, useContext } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { Layer } from 'react-konva';
import useResizeObserver from '@react-hook/resize-observer';

import { LAYER_SIZE } from './base/theme';
import { useViewInfo } from './base/view-info';
import BaseCanvas from './base/canvas';

const SCALE_BY = 1.1;

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const Canvas: FunctionComponent = ({ children }) => {
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);
  const [viewInfo] = useViewInfo();

  useStageContainerSize(stageRef);

  const wheelHandler = useWheelHandler(stageRef);
  const dragBoundHandler = useDragBoundHandler();
  const dragMoveHander = useDragMoveHandler();

  return (
    <BaseCanvas
      className={classes.container}
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
    x: lockBetween(pos.x, LAYER_SIZE - viewInfo.width),
    y: lockBetween(pos.y, LAYER_SIZE - viewInfo.height),
  }), [viewInfo]);
}

function lockBetween(value: number, max: number) {
  if (value > 0) {
    return 0;
  }

  if (value <= -max) {
    return -max + 1;
  }
  
  return value;
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
  const [viewInfo, setViewInfo] = useViewInfo();

  return useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
  
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  
    const newScale = e.evt.deltaY > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;
    const newProps = {
      x: lockBetween(pointer.x - mousePointTo.x * newScale, LAYER_SIZE - viewInfo.width),
      y: lockBetween(pointer.y - mousePointTo.y * newScale, LAYER_SIZE - viewInfo.height),
      scale: newScale
    };

    setViewInfo(viewInfo => ({ ...viewInfo, ...newProps }));
  }, [stageRef.current]);
}
