import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Position, Size, useCanvasDragLayer, MoveDragItem } from './dnd';
import { CanvasControlView } from './view';
import { useControlState } from '../window-state';

const useStyles = makeStyles((theme) => ({
  layer: {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  component: {
    position: 'absolute',
  }
}));

const DragLayer: FunctionComponent = () => {
  const classes = useStyles();
  const { isDragging, item, currentOffset } = useCanvasDragLayer();

  if (!isDragging) {
    return null;
  }

  const moveItem = item as MoveDragItem;

  return (
    <div className={classes.layer}>
      <ControlPreview id={moveItem.id} currentPosition={currentOffset} />
    </div>
  )
};

export default DragLayer;

const ControlPreview: FunctionComponent<{ id: string; currentPosition?: Position; currentSize?: Size }> = ({ id, currentPosition, currentSize }) => {
  const classes = useStyles();
  const { control } = useControlState(id);

  const position = currentPosition || { x: control.x, y: control.y };
  const size = currentSize || { width: control.width, height: control.height };

  return (
    <div className={classes.component} style={{ left: position.x, top: position.y, width: size.width, height: size.height }}>
      <CanvasControlView id={id} />
    </div>
  );
};