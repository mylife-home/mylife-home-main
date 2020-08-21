import React, { FunctionComponent, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { useStageContainerSize } from '../base/stage-behaviors';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

export interface CanvasProps {
  onSizeChange?: (size: number) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ onSizeChange, children }) => {
  const classes = useStyles();
  const stageRef = useRef<Konva.Stage>(null);
  const size = useStageContainerSize(stageRef);

  // mini view is square
  const canvasSize = Math.min(size.height, size.width);

  // TODO: call onSizeChange

  return (
    <Stage className={classes.container} ref={stageRef} width={canvasSize} height={canvasSize}>
      <Layer>
        {children}
      </Layer>
    </Stage>
  );
};

export default Canvas;
