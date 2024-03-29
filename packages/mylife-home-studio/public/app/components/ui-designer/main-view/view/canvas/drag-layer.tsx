import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { useViewState, useControlState, useTemplateInstanceState } from '../view-state';
import { ItemTypes, useCanvasDragLayer, ComponentData, CreateControlComponentData, CreateTemplateInstanceComponentData, MoveComponentData, ResizeComponentData } from './dnd';
import { useContainerRect } from './container';
import { Position, Size } from './types';
import { CanvasViewView, CanvasControlView, CanvasControlCreationView, CanvasTemplateInstanceView } from './view';

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
  const componentData = useCanvasDragLayer();

  if (!componentData) {
    return null;
  }

  return <div className={classes.layer}>{createPreview(componentData)}</div>;
};

function createPreview(componentData: ComponentData) {
  switch (componentData.type) {
    case ItemTypes.CREATE_CONTROL: {
      const createData = componentData as CreateControlComponentData;
      return <CreateControlPreview currentPosition={createData.newPosition} currentSize={createData.newSize} />;
    }

    case ItemTypes.CREATE_TEMPLATE_INSTANCE: {
      const createData = componentData as CreateTemplateInstanceComponentData;
      return <CreateControlPreview currentPosition={createData.newPosition} currentSize={createData.size} />;
    }

    case ItemTypes.MOVE: {
      const moveData = componentData as MoveComponentData;
      switch (moveData.elementType) {
        case 'control':
          return <ControlPreview id={moveData.elementId} currentPosition={moveData.newPosition} />;
        case 'template-instance':
          return <TemplateInstancePreview id={moveData.elementId} currentPosition={moveData.newPosition} />;
      }
    }

    case ItemTypes.RESIZE: {
      const resizeData = componentData as ResizeComponentData;
      return resizeData.id ? <ControlPreview id={resizeData.id} currentSize={resizeData.newSize} /> : <ViewPreview currentSize={resizeData.newSize} />;
    }
  }
}

export default DragLayer;

const ViewPreview: FunctionComponent<{ currentSize?: Size }> = ({ currentSize }) => {
  const classes = useStyles();
  const { view } = useViewState();
  const getContainerRect = useContainerRect();

  const size = currentSize || { width: view.width, height: view.height };
  const { left, top } = getContainerRect();

  return (
    <div className={classes.component} style={{ left, top, ...currentSize }}>
      <CanvasViewView />
      <PreviewLabel size={size} />
    </div>
  );
};

const ControlPreview: FunctionComponent<{ id: string; currentPosition?: Position; currentSize?: Size }> = ({ id, currentPosition, currentSize }) => {
  const classes = useStyles();
  const { control } = useControlState(id);
  const getContainerRect = useContainerRect();

  const position = currentPosition || { x: control.x, y: control.y };
  const { left, top } = getContainerRect();
  const offset = { left: position.x + left, top: position.y + top };
  const size = currentSize || { width: control.width, height: control.height };

  return (
    <div className={classes.component} style={{ ...offset, ...size }}>
      <CanvasControlView id={id} />
      <PreviewLabel position={currentPosition} size={currentSize} />
    </div>
  );
};

const TemplateInstancePreview: FunctionComponent<{ id: string; currentPosition?: Position }> = ({ id, currentPosition }) => {
  const classes = useStyles();
  const { templateInstance, template } = useTemplateInstanceState(id);
  const getContainerRect = useContainerRect();

  const position = currentPosition || { x: templateInstance.x, y: templateInstance.y };
  const { left, top } = getContainerRect();
  const offset = { left: position.x + left, top: position.y + top };
  const size = { width: template.width, height: template.height };

  return (
    <div className={classes.component} style={{ ...offset, ...size }}>
      <CanvasTemplateInstanceView id={id} />
      <PreviewLabel position={currentPosition} />
    </div>
  );
};

const CreateControlPreview: FunctionComponent<{ currentPosition: Position; currentSize: Size }> = ({ currentPosition, currentSize }) => {
  const classes = useStyles();
  const getContainerRect = useContainerRect();

  const { left, top } = getContainerRect();
  const offset = { left: currentPosition.x + left, top: currentPosition.y + top };

  return (
    <div className={classes.component} style={{ ...offset, ...currentSize }}>
      <CanvasControlCreationView />
      <PreviewLabel position={currentPosition} />
    </div>
  );
};

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
