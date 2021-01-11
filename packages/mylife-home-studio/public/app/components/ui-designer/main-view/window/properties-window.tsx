import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useWindowState } from './window-state';

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

const PropertiesWindow: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { window, update } = useWindowState();

  return (
    <div className={className}>
      <div>toolbox window</div>
    </div>
  );
};

export default PropertiesWindow;
