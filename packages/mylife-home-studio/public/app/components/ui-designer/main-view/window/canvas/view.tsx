import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { TextIcon } from '../../../../lib/icons';
import Image from '../../common/image';
import { useWindowState, useControlState } from '../window-state';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: '100%',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
  },
  selected: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  content: {
    height: '100%',
    width: '100%',
  },
}));

const Wrapper: FunctionComponent<{ selected: boolean }> = ({ children, selected }) => {
  const classes = useStyles();

  return <div className={clsx(classes.wrapper, selected && classes.selected)}>{children}</div>;
};

export const CanvasWindowView = () => {
  const { window, selected } = useWindowState();
  const classes = useStyles();

  return (
    <Wrapper selected={selected}>
      <Image resource={window.backgroundResource} className={classes.content} />
    </Wrapper>
  );
};

export const CanvasControlView: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, selected } = useControlState(id);
  const classes = useStyles();

  return (
    <Wrapper selected={selected}>
      {control.text ? <TextIcon className={classes.content} /> : <Image resource={control.display.defaultResource} className={classes.content} />}
    </Wrapper>
  );
};
