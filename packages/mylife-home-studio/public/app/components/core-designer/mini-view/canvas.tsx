import React, { FunctionComponent, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { Layer } from 'react-konva';
import { useStageContainerSize } from '../base/stage-behaviors';
import { LAYER_SIZE } from '../base/theme';
import BaseCanvas from '../base/canvas';

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
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);
  const size = useStageContainerSize(stageRef);

  // mini view is square
  const canvasSize = Math.min(size.height, size.width);
  const scale = canvasSize / LAYER_SIZE;

  // TODO: call onSizeChange

  return (
    <BaseCanvas className={classes.container} ref={stageRef} width={canvasSize} height={canvasSize} scaleX={scale} scaleY={scale}>
      <Layer>
        {children}
      </Layer>
    </BaseCanvas>
  );
};

export default Canvas;
