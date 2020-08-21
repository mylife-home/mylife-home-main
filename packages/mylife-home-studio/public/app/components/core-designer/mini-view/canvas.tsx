import React, { FunctionComponent, useRef } from 'react';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { useStageContainerSize } from '../base/stage-behaviors';
import { CanvasThemeProvider, LAYER_SIZE } from '../base/theme';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

export interface CanvasProps {
  onSizeChange?: (size: number, scale: number) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ onSizeChange, children }) => {
  const muiTheme = useMuiTheme();
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);
  const size = useStageContainerSize(stageRef);

  // mini view is square
  const canvasSize = Math.min(size.height, size.width);
  const scale = canvasSize / LAYER_SIZE;

  // TODO: call onSizeChange

  return (
    <Stage className={classes.container} ref={stageRef} width={canvasSize} height={canvasSize} scaleX={scale} scaleY={scale}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <Layer>
          {children}
        </Layer>
      </CanvasThemeProvider>
    </Stage>
  );
};

export default Canvas;
