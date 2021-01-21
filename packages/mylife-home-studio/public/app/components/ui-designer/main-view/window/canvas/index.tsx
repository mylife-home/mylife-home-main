import React, { FunctionComponent } from 'react';
import { AutoSizer } from 'react-virtualized';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useSelectableControlList } from '../window-state';
import { useDroppable } from './dnd';
import { CanvasContainerContextProvider, CanvasContainer } from './container';
import DragLayer from './drag-layer';
import CanvasControl from './control';
import CanvasWindow from './window';

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

// TODO: cleanup CanvasItem
// TODO: cleanup: preview and drop should use same algo to compute new layout
// TODO: snap to grid (create, move, resize)
// TODO: control cannot go outside of window (create, move, resize) + handle that on window resize => compute position ratio, and move to find inside window. window cannot be smaller that larger of its control