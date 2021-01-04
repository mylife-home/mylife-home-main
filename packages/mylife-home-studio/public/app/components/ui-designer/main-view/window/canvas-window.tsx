import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useWindowState } from './use-window-state';
import { useSelection } from './selection';
import RndBox from './rnd-box';
import CanvasControl from './canvas-control';
import Image from './image';

const useStyles = makeStyles((theme) => ({
  container: {
    overflow : 'auto',
    position: 'relative', // RndBox is absolute
  },
  windowContainer: {
    margin: '10px',
  },
  window: {
    height: '100%',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
  },
  windowSelected: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  background: {
    height: '100%',
    width: '100%'
  }
}));

const CanvasWindow: FunctionComponent<{ className: string; }> = ({ className }) => {
  const { window, /*updater,*/ } = useWindowState();
  const { selection, select } = useSelection();
  const classes = useStyles();
  const selected = !selection;

  const updater = (arg: any) => {};

  //connectDropTarget
  return (
    <div className={clsx(classes.container, className)} onClick={(e) => { e.stopPropagation(); select(null); }}>
      <div className={classes.windowContainer}>
        <RndBox size={{ width: window.width, height: window.height}} onResize={(size) => updater(size)}>
          <div className={clsx(classes.window, selected && classes.windowSelected)}>
            <Image resource={window.backgroundResource} className={classes.background}/>
            {window.controls.map((id) => (
              <CanvasControl key={id} id={id} />)
            )}
          </div>
        </RndBox>
      </div>
    </div>
  );
};

export default CanvasWindow;
