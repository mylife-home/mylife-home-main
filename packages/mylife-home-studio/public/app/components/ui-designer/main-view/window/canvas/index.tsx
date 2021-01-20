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
  const { controlsIds } = useSelectableControlList();
  const classes = useStyles();
  const drop = useDroppable();

  return (
    <CanvasContainerContextProvider>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ height, width }} className={clsx(classes.container, className)} ref={drop}>
            <CanvasContainer className={classes.wrapper}>

              <CanvasWindow />

              {controlsIds.map(id => (
                <CanvasControl key={id} id={id} />
              ))}

            </CanvasContainer>
          </div>
        )}
      </AutoSizer>

      <DragLayer />
    </CanvasContainerContextProvider>
  );
};

export default Canvas;

// TODO: cleanup CanvasItem
// TODO: cleanup: preview and drop should use same algo to compute new layout
// TODO: snap to grid (create, move, resize)
// TODO: control cannot go outside of window (create, move, resize) + handle that on window resize => compute position ratio, and move to find inside window. window cannot be smaller that larger of its control