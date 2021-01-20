import React, { FunctionComponent, useRef } from 'react';
import { AutoSizer } from 'react-virtualized';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useWindowState } from '../window-state';
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
  const { window } = useWindowState();
  const classes = useStyles();
  const drop = useDroppable();

  return (
    <CanvasContainerContextProvider>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ height, width }} className={clsx(classes.container, className)} ref={drop}>
            <CanvasContainer className={classes.wrapper}>

              <CanvasWindow />

              {window.controls.map(({ id }) => (
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
