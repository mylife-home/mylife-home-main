import React, { FunctionComponent } from 'react';
import { AutoSizer } from 'react-virtualized';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Image from '../../common/image';
import { useWindowState } from '../window-state';
import CanvasItem from './item';
import CanvasControl from './control';
import { useDroppable } from './dnd';

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
    <AutoSizer>
      {({ height, width }) => (
        <div style={{ height, width }} className={clsx(classes.container, className)} ref={ref}>
          <div className={classes.windowContainer}>
            <CanvasItem size={{ width: window.width, height: window.height }} onResize={(size) => update(size)} selected={selected} onSelect={select}>
              <Image resource={window.backgroundResource} className={classes.background} />

              {window.controls.map(({ id }) => (
                <CanvasControl key={id} id={id} />
              ))}
            </CanvasItem>
          </div>
        </div>
      )}
    </AutoSizer>
  );
};

export default CanvasWindow;
