import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

import { ImageIcon } from '../../../lib/icons';
import { useSelection, useWindowState, useControlState, useCreateControl, SelectionType } from './window-state';
import { useMoveable } from './canvas-dnd';

const useStyles = makeStyles((theme) => ({
  container: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  controls: {
  },
  control: {
    margin: theme.spacing(4),
    cursor: 'copy',
  },
  properties: {
    flex: 1,
    overflowY: 'auto',
  },
}));

const Toolbox: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { type, id } = useSelection();

  return (
    <div className={clsx(classes.container, className)}>
      <Controls />
      {getProperties(type, id)}
    </div>
  );
};

export default Toolbox;

const Controls: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.controls}>
      <Control image={ImageIcon} tooltip="Drag and drop sur la fenêtre pour ajouter un contrôle" />
    </div>
  );
};

const Control: FunctionComponent<{ tooltip: string; image: typeof SvgIcon; }> = ({ tooltip, image }) => {
  const classes = useStyles();
  const onCreate = useCreateControl();
  const { ref, isMoving } = useMoveable(onCreate);
  const Image = image;

  return (
    <Tooltip title={tooltip}>
      <IconButton disableRipple className={classes.control} ref={ref}>
        <Image fontSize="large" />
      </IconButton>
    </Tooltip>
  );
};

function getProperties(type: SelectionType, id: string) {
  switch (type) {
    case 'window':
      return <WindowProperties />;
    case 'control':
      return <ControlProperties id={id} />;
  }
}

const WindowProperties: FunctionComponent = () => {
  const classes = useStyles();
  const { window, update } = useWindowState();

  return (
    <div className={classes.properties}>
      <div>toolbox window</div>
    </div>
  );
};

const ControlProperties: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { control, update } = useControlState(id);

  return (
    <div className={classes.properties}>
      <div>toolbox control {control.id}</div>
      <div>TODO: duplicate control</div>
    </div>
  );
};
