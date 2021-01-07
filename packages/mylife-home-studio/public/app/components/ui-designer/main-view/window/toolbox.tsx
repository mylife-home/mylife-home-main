import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useSelection, useWindowState, useControlState, SelectionType } from './window-state';

const useStyles = makeStyles((theme) => ({
  container: {
    overflowY: 'auto',
  },
}));

const Toolbox: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { type, id } = useSelection();

  return (
    <div className={clsx(classes.container, className)}>
      {getDisplay(type, id)}
    </div>
  );
};

export default Toolbox;

function getDisplay(type: SelectionType, id: string) {
  switch (type) {
    case 'window':
      return <WindowToolbox />;
    case 'control':
      return <ControlToolbox id={id} />;
  }
}

const WindowToolbox: FunctionComponent = () => {
  const { window, update } = useWindowState();

  return (
    <>
      <div>toolbox window</div>
    </>
  );
};

const ControlToolbox: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update } = useControlState(id);

  return (
    <>
      <div>toolbox control {control.id}</div>
      <div>TODO: duplicate control</div>
    </>
  );
};