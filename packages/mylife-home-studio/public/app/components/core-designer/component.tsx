import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

export interface ComponentProps {
  x: number;
  y: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
  },
}));

const Component: FunctionComponent<ComponentProps> = ({ x, y }) => {
  const classes = useStyles();
  return (
    <div style={{ left: x, top: y }} className={classes.root}>
      Component
    </div>
  );
};

export default Component;