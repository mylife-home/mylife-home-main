import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Toolbar from '@material-ui/core/Toolbar';

const STATUS_HEIGHT = 24;

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: STATUS_HEIGHT,
    height: STATUS_HEIGHT,
    
    // backgroundColor: theme.palette.grey[100],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    '& > *': {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
    },
  },
  middle: {
    flex: 1,
  }
}));

const StatusBar: FunctionComponent<{className ?: string; }> = ({ className, children }) => {
  const classes = useStyles();

  return (
    <Toolbar className={clsx(className, classes.root)} disableGutters>
      {children}
    </Toolbar>
  );
};

export default StatusBar;

export const StatusSeparator: FunctionComponent = () => {
  const classes = useStyles();
  
  return <div className={classes.middle} />
}