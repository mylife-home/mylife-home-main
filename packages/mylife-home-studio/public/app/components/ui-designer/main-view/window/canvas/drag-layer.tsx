import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { createNewControl } from '../../common/templates';
import { useWindowState, useControlState } from '../window-state';
import { ItemTypes, useCanvasDragLayer, DragItem, CreateDragItem, MoveDragItem, ResizeDragItem } from './dnd';
import { useContainerRect } from './container';
import { Position, ResizeDirection, Size } from './types';
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
  },
  label: {
    position: 'absolute',
    top: 0,
    left: 0,

    padding: theme.spacing(1),
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
  }
}));

const DragLayer: FunctionComponent = () => {
  const classes = useStyles();
  const { isDragging, item, currentOffset, delta } = useCanvasDragLayer();

  if (!isDragging) {
    return null;
  }

  return <div className={classes.layer}>{createPreview(item, currentOffset, delta)}</div>;
};

function createPreview(item: DragItem, currentOffset: Position, delta: Position) {
  switch (item.type) {
    case ItemTypes.CREATE: {
      const createItem = item as CreateDragItem;
      if (!currentOffset) {
        return null;
      }

      return <CreateControlPreview currentPosition={currentOffset} />;
    }

    case ItemTypes.MOVE: {
      const moveItem = item as MoveDragItem;
      if (!currentOffset) {
        return null;
      }

      return <ControlPreview id={moveItem.id} currentPosition={currentOffset} />;
    }

    case ItemTypes.RESIZE: {
      const resizeItem = item as ResizeDragItem;
      if (!delta) {
        return null;
      }

      const sizeDelta = fixDelta(delta, resizeItem.direction);
      return resizeItem.id ? <ControlPreview id={resizeItem.id} sizeDelta={sizeDelta} /> : <WindowPreview sizeDelta={sizeDelta} />;
    }
  }
}

export default DragLayer;

function fixDelta(delta: Position, direction: ResizeDirection) {
  switch (direction) {
    case 'right':
      return { ...delta, y: 0 };
    case 'bottom':
      return { ...delta, x: 0 };
    case 'bottomRight':
      return delta;
  }
}

const WindowPreview: FunctionComponent<{ sizeDelta?: Position }> = ({ sizeDelta }) => {
  const classes = useStyles();
  const { window } = useWindowState();
  const getContainerRect = useContainerRect();

  const size = computePreviewSize(window, sizeDelta);
  const { left, top } = getContainerRect();

  return (
    <div className={classes.component} style={{ left, top, width: size.width, height: size.height }}>
      <CanvasWindowView />
      <PreviewLabel size={size} />
    </div>
  );
};

const ControlPreview: FunctionComponent<{ id: string; currentPosition?: Position; sizeDelta?: Position }> = ({ id, currentPosition, sizeDelta }) => {
  const classes = useStyles();
  const { control } = useControlState(id);
  const getContainerRect = useContainerRect();

  let position = currentPosition;
  if (!position) {
    const { left, top } = getContainerRect();
    position = { x: control.x + left, y: control.y + top };
  }
  
  const size = computePreviewSize(control, sizeDelta);

  return (
    <div className={classes.component} style={{ left: position.x, top: position.y, width: size.width, height: size.height }}>
      <CanvasControlView id={id} />
      <PreviewLabel position={currentPosition} size={sizeDelta ? size : null} />
    </div>
  );
};

const CreateControlPreview: FunctionComponent<{ currentPosition: Position }> = ({ currentPosition }) => {
  const classes = useStyles();
  const size = useMemo(() => {
    const { width, height } = createNewControl();
    const size: Size = { width, height };
    return size;
  }, []);

  return (
    <div className={classes.component} style={{ left: currentPosition.x, top: currentPosition.y, width: size.width, height: size.height }}>
      <CanvasControlCreationView />
      <PreviewLabel position={currentPosition} />
    </div>
  );
};

function computePreviewSize<TModel extends Size>(model: TModel, sizeDelta: Position) {
  if (!sizeDelta) {
    const size: Size = { width: model.width, height: model.height };
    return size;
  }

  const size: Size = {
    width: Math.max(0, model.width + sizeDelta.x),
    height: Math.max(0, model.height + sizeDelta.y),
  };
  return size;
}

const PreviewLabel: FunctionComponent<{ size?: Size; position?: Position }> = ({ size, position }) => {
  const classes = useStyles();
  const text = computePreviewLabelText(size, position);
  if (!text) {
    return null;
  }

  return (
    <Typography className={classes.label} noWrap>{text}</Typography>
  );
};

function computePreviewLabelText(size: Size, position: Position) {
  if(size) {
    return `${size.width} x ${size.height}`;
  }

  if(position) {
    return `{${position.x}; ${position.y}}`;
  }
}
