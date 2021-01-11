import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';

import { ImageIcon } from '../../../lib/icons';
import { useSelection, useCreateControl, SelectionType } from './window-state';
import { useCreatable } from './canvas-dnd';
import PropertiesWindow from './properties-window';
import PropertiesControl from './properties-control';

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
      {getProperties(type, id, classes.properties)}
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
  const ref = useCreatable(onCreate);
  const Image = image;

  return (
    <Tooltip title={tooltip}>
      <IconButton disableRipple className={classes.control} ref={ref}>
        <Image fontSize="large" />
      </IconButton>
    </Tooltip>
  );
};

function getProperties(type: SelectionType, id: string, className: string) {
  switch (type) {
    case 'window':
      return <PropertiesWindow className={className} />;
    case 'control':
      return <PropertiesControl id={id} className={className} />;
  }
}
