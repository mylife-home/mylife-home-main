import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

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

let counter = 0;

const StartPage: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={clsx(classes.flexContent, classes.subContainer)}>
        <div className={classes.flexContent}>
          <UiDesigner />
        </div>

        <div className={classes.flexContent}>
          <CoreDesigner />
        </div>
      </div>

      <div className={classes.flexContent}>
        <Online />
      </div>
    </div>
  );
};

const CoreDesigner: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Grid container spacing={3} className={classes.gridContainer}>
      <Grid item xs={12}>
        <Typography variant="h6">Designers UI</Typography>
      </Grid>
      <Grid item xs={12}>
        <UiProjectList />
      </Grid>
    </Grid>
  );
};

const UiDesigner: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Grid container spacing={3} className={classes.gridContainer}>
      <Grid item xs={12}>
        <Typography variant="h6">Designers Core</Typography>
      </Grid>
      <Grid item xs={12}>
        <CoreProjectList />
      </Grid>
    </Grid>
  );
};

export default StartPage;
