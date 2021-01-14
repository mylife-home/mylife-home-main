import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useWindowState } from './window-state';
import CanvasItem from './canvas-item';
import CanvasControl from './canvas-control';
import Image from '../common/image';
import { useDroppable } from './canvas-dnd';

const useStyles = makeStyles((theme) => ({
  container: {
    overflow: 'auto',
    position: 'relative', // CanvasItem is absolute
  },
  windowContainer: {
    margin: '10px',
  },
  background: {
    height: '100%',
    width: '100%',
  },
}));

const CanvasWindow: FunctionComponent<{ className?: string }> = ({ className }) => {
  const { window, update, selected, select } = useWindowState();
  const classes = useStyles();
  const ref = useDroppable();

  return (
    <div className={clsx(classes.container, className)} ref={ref}>
      <div className={classes.windowContainer}>
        <CanvasItem size={{ width: window.width, height: window.height }} onResize={(size) => update(size)} selected={selected} onSelect={select}>
          <Image resource={window.backgroundResource} className={classes.background} />

          {window.controls.map(({ id }) => (
            <CanvasControl key={id} id={id} />
          ))}
        </CanvasItem>
      </div>
    </div>
  );
};

export default CanvasWindow;
