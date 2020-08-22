import React, { FunctionComponent, useRef, useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import useResizeObserver from '@react-hook/resize-observer';

import { CanvasThemeProvider, LAYER_SIZE } from './base/theme';

const SCALE_BY = 1.1;

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ViewChangeCallback = (rect: Rectangle, scale: number) => void;

export interface CanvasProps {
  onViewChange?: ViewChangeCallback;
}

export interface ViewInfo {
  x: number;
  y: number;
  height: number;
  width: number;
  scale: number;
}

const Canvas: FunctionComponent<CanvasProps> = ({ onViewChange = () => {}, children }) => {
  const muiTheme = useMuiTheme();
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);
  const [viewInfo, setViewInfo] = useState<ViewInfo>({ x: 0, y: 0, height: 0, width: 0, scale: 1 });

  console.log('viewInfo', viewInfo);

  useStageContainerSize(stageRef, setViewInfo);

  const wheelHandler = useWheelHandler(stageRef, viewInfo, setViewInfo);
  const dragBoundHandler = useDragBoundHandler(viewInfo);
  const dragMoveHander = useDragMoveHandler(setViewInfo);

  // TODO: call onViewChange

  return (
    <Stage className={classes.container} ref={stageRef} width={viewInfo.width} height={viewInfo.height} draggable dragBoundFunc={dragBoundHandler} onWheel={wheelHandler} onDragMove={dragMoveHander}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <Layer>
          {children}
        </Layer>
      </CanvasThemeProvider>
    </Stage>
    );
};

export default Canvas;

function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>, setViewInfo: React.Dispatch<React.SetStateAction<ViewInfo>>) {

  const setSize = useCallback((size: { width: number; height: number}) => setViewInfo(viewInfo => ({ ...viewInfo, ...size })), [setViewInfo]);

  useLayoutEffect(() => {
    if(stageRef.current) {
      setSize(stageRef.current.container().getBoundingClientRect());
    }
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
}

function useDragBoundHandler(viewInfo: ViewInfo) {
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

function useDragMoveHandler(setViewInfo: React.Dispatch<React.SetStateAction<ViewInfo>>) {
  const setPos = useCallback((pos: { x: number, y: number }) => setViewInfo(viewInfo => ({ ...viewInfo, ...pos })), [setViewInfo]);

  return useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    setPos({ x: -stage.x(), y: -stage.y() });
  }, [setViewInfo]);
}

function useWheelHandler(stageRef: React.MutableRefObject<Konva.Stage>, viewInfo: ViewInfo, setViewInfo: React.Dispatch<React.SetStateAction<ViewInfo>>) {
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
  
    stage.scale({ x: newScale, y: newScale });
  
    const newPos = {
      x: lockBetween(pointer.x - mousePointTo.x * newScale, LAYER_SIZE - viewInfo.width),
      y: lockBetween(pointer.y - mousePointTo.y * newScale, LAYER_SIZE - viewInfo.height),
    };
  
    stage.position(newPos);

    setViewInfo(viewInfo => ({ ...viewInfo, ...newPos, scale: newScale }));

    stage.batchDraw();
  }, [stageRef.current]);
}
