import React, { FunctionComponent, useRef } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import useResizeObserver from '@react-hook/resize-observer';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { CanvasThemeProvider } from './base/theme';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const Canvas: FunctionComponent = ({ children }) => {
  const muiTheme = useMuiTheme();
  const classes = useStyles();

  const [size, ref] = useStageContainerSize();
  
  return (
    <Stage className={classes.container} ref={ref} width={size.width} height={size.height}>
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