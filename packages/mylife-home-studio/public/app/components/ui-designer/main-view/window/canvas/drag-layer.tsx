import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useCanvasDragLayer } from './dnd';

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
}));

const DragLayer: FunctionComponent = () => {
  const classes = useStyles();
  const { isDragging } = useCanvasDragLayer();

  if (!isDragging) {
    return null;
  }

  return (
    <div className={classes.layer}>
    </div>
  )
};

export default DragLayer;