import React, { FunctionComponent } from 'react';
import { AutoSizer } from 'react-virtualized';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useWindowState } from '../window-state';
import CanvasControl from './control';
import CanvasWindow from './window';
import { useDroppable } from './dnd';

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
    <AutoSizer>
      {({ height, width }) => (
        <div style={{ height, width }} className={clsx(classes.container, className)} ref={drop}>
          <div className={classes.wrapper}>

            <CanvasWindow />

            {window.controls.map(({ id }) => (
              <CanvasControl key={id} id={id} />
            ))}

          </div>
        </div>
      )}
    </AutoSizer>
  );
};

export default Canvas;
