import React, { FunctionComponent, useRef, useCallback } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import useResizeObserver from '@react-hook/resize-observer';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
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

export interface CanvasProps {
  onViewChange?: (rect: Rectangle, scale: number) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ onViewChange, children }) => {
  const muiTheme = useMuiTheme();
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);

  const size = useStageContainerSize(stageRef);
  const wheelHandler = useWheelHandler(stageRef, size);
  const dragBoundHandler = useDragBoundHandler(size);

  // TODO: call onViewChange

  return (
    <Stage className={classes.container} ref={stageRef} width={size.width} height={size.height} draggable dragBoundFunc={dragBoundHandler} onWheel={wheelHandler}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <Layer>
          {children}
        </Layer>
      </CanvasThemeProvider>
    </Stage>
    );
};

export default Canvas;

interface Size {
  width: number;
  height: number;
}

const DEFAULT_SIZE: Size = { width: 0, height: 0 };

function useStageContainerSize(stageRef: React.MutableRefObject<Konva.Stage>): Size {
  const [size, setSize] = React.useState<Size>(DEFAULT_SIZE);
 
  React.useLayoutEffect(() => {
    setSize(stageRef.current?.container().getBoundingClientRect() || DEFAULT_SIZE);
  }, [stageRef.current]);
 
  useResizeObserver(stageRef.current?.container(), (entry) => setSize(entry.contentRect));

  return size;
}

function useDragBoundHandler(size: Size) {
  return useCallback((pos: Konva.Vector2d) => ({
    x: lockBetween(pos.x, LAYER_SIZE - size.width),
    y: lockBetween(pos.y, LAYER_SIZE - size.height),
  }), [size]);
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

function useWheelHandler(stageRef: React.MutableRefObject<Konva.Stage>, size: Size) {
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
      x: lockBetween(pointer.x - mousePointTo.x * newScale, LAYER_SIZE - size.width),
      y: lockBetween(pointer.y - mousePointTo.y * newScale, LAYER_SIZE - size.height),
    };
  
    stage.position(newPos);
    stage.batchDraw();
  }, [stageRef.current]);
}