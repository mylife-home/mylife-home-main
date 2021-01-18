import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Image from '../../common/image';
import { useWindowState } from '../window-state';
import CanvasItem from './item';

const useStyles = makeStyles((theme) => ({
  background: {
    height: '100%',
    width: '100%',
  },
}));

const CanvasWindow: FunctionComponent = () => {
  const { window, update, selected, select } = useWindowState();
  const classes = useStyles();

  return (
    <CanvasItem size={{ width: window.width, height: window.height }} onResize={(size) => update(size)} selected={selected} onSelect={select}>
      <Image resource={window.backgroundResource} className={classes.background} />
    </CanvasItem>
  );
};

export default CanvasWindow;
