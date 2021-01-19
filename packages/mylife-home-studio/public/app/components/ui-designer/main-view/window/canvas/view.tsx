import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TextIcon } from '../../../../lib/icons';
import Image from '../../common/image';
import { useWindowState, useControlState } from '../window-state';

const useStyles = makeStyles((theme) => ({
  content: {
    height: '100%',
    width: '100%',
  },
}));

export const CanvasWindowView = () => {
  const { window } = useWindowState();
  const classes = useStyles();

  return <Image resource={window.backgroundResource} className={classes.content} />;
}

export const CanvasControlView: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control } = useControlState(id);
  const classes = useStyles();

  return control.text ? 
    <TextIcon className={classes.content} /> :
    <Image resource={control.display.defaultResource} className={classes.content} />;
};
