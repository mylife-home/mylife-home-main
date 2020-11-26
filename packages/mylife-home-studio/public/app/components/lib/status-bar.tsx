import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Toolbar from '@material-ui/core/Toolbar';

const STATUS_HEIGHT = 36;

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: STATUS_HEIGHT,
    height: STATUS_HEIGHT,
    
    // backgroundColor: theme.palette.grey[100],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  }
}));

const StatusBar: FunctionComponent<{className ?: string; }> = ({ className, children }) => {
  const classes = useStyles();

  return (
    <Toolbar className={clsx(className, classes.root)}>
      {children}
    </Toolbar>
  );
};

export default StatusBar;
