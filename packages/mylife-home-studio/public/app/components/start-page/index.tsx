import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import UiProjectList from './ui-project-list';
import CoreProjectList from './core-project-list';
import Online from './online';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    width: 0,
    flex: 1,
  },
}));

const StartPage: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <CoreProjectList className={classes.column} />
      <UiProjectList className={classes.column} />
      <Online className={classes.column} />
    </div>
  );
};

export default StartPage;
