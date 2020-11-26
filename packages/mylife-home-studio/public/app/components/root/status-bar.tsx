import React, { FunctionComponent, useMemo } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
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

const StatusBar: FunctionComponent<{className ?: string; }> = ({ className }) => {
  const classes = useStyles();

  return (
    <Toolbar className={clsx(className, classes.root)}>
      TODO
    </Toolbar>
  );
};

export default StatusBar;
