import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Criteria from './criteria';
import List from './list';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  criteria: {
  },
  list: {
    flex: 1,
  }
}));

const OnlineLogsView: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Criteria className={classes.criteria} />
      <List className={classes.list} />
    </div>
  );
};

export default OnlineLogsView;
