import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

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
    background: 'blue'
  }
}));

const Canvas: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>

      </div>
    </div>
  );
};

export default Canvas;