import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { relative } from 'path';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    overflow: 'auto',
  },
  container: {
    width: 10000,
    height: 10000,
    background: theme.palette.background.default,
    position: 'relative',
  }
}));

const Canvas: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        {children}
      </div>
    </div>
  );
};

export default Canvas;