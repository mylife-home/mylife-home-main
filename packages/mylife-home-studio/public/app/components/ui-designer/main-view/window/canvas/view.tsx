import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Image from '../../common/image';
import { useWindowState, useControlState } from '../window-state';
import { useTextValue } from '../control-text-value';
import { UiControlTextData } from '../../../../../../../shared/project-manager';

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
      {control.text ? <TextView className={classes.content} text={control.text} /> : <Image resource={control.display.defaultResource} className={classes.content} />}
    </Wrapper>
  );
};

const TextView: FunctionComponent<{ className?: string; text: UiControlTextData }> = ({ className, text }) => {
  const value = useTextValue(text);
  return (
    <div className={className}>
      {value}
    </div>
  )
}

export const CanvasControlCreationView: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Wrapper selected>
      <div className={classes.content} />
    </Wrapper>
  );
}