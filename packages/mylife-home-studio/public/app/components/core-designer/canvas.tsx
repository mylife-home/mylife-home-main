import React, { FunctionComponent, useRef, useCallback } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import useResizeObserver from '@react-hook/resize-observer';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { CanvasThemeProvider } from './base/theme';
import { Vector2d } from 'konva/types/types';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const LAYER_SIZE = 10000;

const Canvas: FunctionComponent = ({ children }) => {
  const muiTheme = useMuiTheme();
  const classes = useStyles();

  const [size, ref] = useStageContainerSize();

  const lockDragToLayer = useCallback((pos: Vector2d) => ({
    x: lockBetween(pos.x, LAYER_SIZE - size.width),
    y: lockBetween(pos.y, LAYER_SIZE - size.height),
  }), [size]);

  return (
    <Stage className={classes.container} ref={ref} width={size.width} height={size.height} draggable dragBoundFunc={lockDragToLayer}>
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

function useStageContainerSize(): [Size, React.MutableRefObject<Konva.Stage>] {
  const ref = useRef<Konva.Stage>(null);

  const [size, setSize] = React.useState<Size>(DEFAULT_SIZE);
 
  React.useLayoutEffect(() => {
    setSize(ref.current?.container().getBoundingClientRect() || DEFAULT_SIZE);
  }, [ref]);
 
  useResizeObserver(ref.current?.container(), (entry) => setSize(entry.contentRect));

  return [size, ref];
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
