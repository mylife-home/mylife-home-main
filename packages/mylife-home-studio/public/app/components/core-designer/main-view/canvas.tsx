import React, { FunctionComponent, useCallback, useLayoutEffect, MutableRefObject, useState } from 'react';
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

export interface MetaDragEvent {
  type: 'start' | 'move' | 'end';
  position: { x: number; y: number; };
}

const Canvas: FunctionComponent<{ stageRef: MutableRefObject<Konva.Stage>; onMetaDrag: (e: MetaDragEvent) => void; }> = ({ stageRef, onMetaDrag, children }) => {
  const classes = useStyles();
  const ref = useDroppable(stageRef.current);
  const { viewInfo } = useViewInfo();

  useStageContainerSize(stageRef);

  const wheelHandler = useWheelHandler(stageRef);
  const onDragMove = useDragMoveHandler();
  const { onMouseDown, onMouseMove, onMouseUp } = useMetaSelect(onMetaDrag);

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
        onDragMove={onDragMove}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
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

function useMetaSelect(onMetaDrag: (e: MetaDragEvent) => void) {
  const [selecting, setSelecting] = useState(false);

  const fireMetaDrag = useCallback((e: Konva.KonvaEventObject<MouseEvent>, type: 'start' | 'move' | 'end') => {
    e.evt.preventDefault();
    e.evt.stopPropagation();

    const stage = e.target as Konva.Stage;
    const { x, y } = stage.getPointerPosition();
    onMetaDrag({ type, position: { x, y }});
  }, [onMetaDrag]);

  const onMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!(e.target instanceof Konva.Stage)) {
      return;
    }

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    if (!metaPressed) {
      return;
    }

    setSelecting(true);
    fireMetaDrag(e, 'start');
  }, [setSelecting, fireMetaDrag]);

  const onMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selecting) {
      fireMetaDrag(e, 'move');
    }
  }, [selecting, fireMetaDrag]);


  const onMouseUp = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (selecting) {
      setSelecting(false);
      fireMetaDrag(e, 'end');
    }
  }, [selecting, setSelecting, fireMetaDrag]);

  return { onMouseDown, onMouseMove, onMouseUp };
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
