import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { createNewControl } from '../../common/templates';
import { useWindowState, useControlState } from '../window-state';
import { ItemTypes, useCanvasDragLayer, DragItem, CreateDragItem, MoveDragItem, ResizeDragItem } from './dnd';
import { Position, Size } from './types';
import { CanvasWindowView, CanvasControlView, CanvasControlCreationView } from './view';

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

  return (
    <div className={classes.layer}>
      {createPreview(item, currentOffset)}
    </div>
  )
};

function createPreview(item: DragItem, currentOffset: Position) {
  switch (item.type) {
    case ItemTypes.CREATE: {
      const createItem = item as CreateDragItem;
      if(!currentOffset) {
        return null;
      }

      return (
        <CreateControlPreview currentPosition={currentOffset} />
      );
    }

    case ItemTypes.MOVE: {
      const moveItem = item as MoveDragItem;
      if (!currentOffset) {
        return null;
      }

      return (
        <ControlPreview id={moveItem.id} currentPosition={currentOffset} />
      );
    }

    case ItemTypes.RESIZE: {
      const resizeItem = item as ResizeDragItem;
      // TODO
      return null;
    }
  }
}

export default DragLayer;

const WindowPreview: FunctionComponent<{ currentSize?: Size; }> = ({ currentSize }) => {
  const classes = useStyles();
  const { window } = useWindowState();

  const size = currentSize || { width: window.width, height: window.height };

  return (
    <div className={classes.component} style={{ width: size.width, height: size.height }}>
      <CanvasWindowView />
    </div>
  );
};

const ControlPreview: FunctionComponent<{ id: string; currentPosition?: Position; currentSize?: Size; }> = ({ id, currentPosition, currentSize }) => {
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

const CreateControlPreview: FunctionComponent<{ currentPosition: Position; }> = ({ currentPosition }) => {
  const classes = useStyles();
  const size = useMemo(() => {
    const { width, height } = createNewControl();
    const size: Size = { width, height };
    return size;
  }, []);

  return (
    <div className={classes.component} style={{ left: currentPosition.x, top: currentPosition.y, width: size.width, height: size.height }}>
      <CanvasControlCreationView />
    </div>
  )
}