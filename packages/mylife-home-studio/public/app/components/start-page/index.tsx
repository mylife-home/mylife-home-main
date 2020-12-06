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
  subContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexContent: {
    flex: 1,
  },
  gridContainer: {
    margin: theme.spacing(3),
  },
  link: {
    marginLeft: theme.spacing(3),
  },
}));

const StartPage: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={clsx(classes.flexContent, classes.subContainer)}>
        <div className={classes.flexContent}>
          <CoreProjectList />
        </div>

        <div className={classes.flexContent}>
          <UiProjectList />
        </div>
      </div>

      <div className={classes.flexContent}>
        <Online />
      </div>
    </div>
  );
};

export default StartPage;
