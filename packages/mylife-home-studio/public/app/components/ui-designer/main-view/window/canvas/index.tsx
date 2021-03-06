import React, { FunctionComponent } from 'react';
import { AutoSizer } from 'react-virtualized';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useSelectableControlList, useWindowState, useControlState } from '../window-state';
import { useDroppable } from './dnd';
import { CanvasContainerContextProvider, CanvasContainer } from './container';
import DragLayer from './drag-layer';
import CanvasItem from './item';
import { CanvasWindowView, CanvasControlView } from './view';

const useStyles = makeStyles((theme) => ({
  container: {
    overflow: 'auto',
  },
  wrapper: {
    position: 'relative', // CanvasItem is absolute
    margin: '10px',
  },
}));

const Canvas: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { controlsIds } = useSelectableControlList();

  return (
    <CanvasContainerContextProvider>
      <AutoSizer>
        {({ height, width }) => (
          <DropContainer style={{ height, width }} className={clsx(classes.container, className)}>
            <CanvasContainer className={classes.wrapper}>

              <CanvasWindow />

              {controlsIds.map(id => (
                <CanvasControl key={id} id={id} />
              ))}

            </CanvasContainer>
          </DropContainer>
        )}
      </AutoSizer>
  
      <DragLayer />
    </CanvasContainerContextProvider>
  );
};

export default Canvas;

const DropContainer: FunctionComponent<{ style?: React.CSSProperties, className?: string }> = ({ style, className, children }) => {
  // need to access useDroppable inner CanvasContainerContextProvider
  const drop = useDroppable();

  return (
    <div style={style} className={className} ref={drop}>
      {children}
    </div>
  );
}

const CanvasWindow: FunctionComponent = () => {
  const { window, update, selected, select } = useWindowState();

  return (
    <CanvasItem size={{ width: window.width, height: window.height }} onResize={(size) => update(size)} selected={selected} onSelect={select}>
      <CanvasWindowView />
    </CanvasItem>
  );
};

const CanvasControl: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update, selected, select } = useControlState(id);

  return (
    <CanvasItem
      id={id}
      size={{ width: control.width, height: control.height }}
      position={{ x: control.x, y: control.y }}
      selected={selected}
      onResize={(size) => update(size)}
      onMove={(position) => update(position)}
      onSelect={select}
    >
      <CanvasControlView id={id} />
    </CanvasItem>
  );
};
