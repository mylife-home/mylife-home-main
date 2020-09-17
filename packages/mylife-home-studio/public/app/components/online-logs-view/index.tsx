import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { getItems } from '../../store/online-logs-view/selectors';
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
  const { data } = useConnect();
  const finalData = useMemo(() => data.slice().reverse(), [data]);
  return (
    <div className={classes.container}>
      <Criteria className={classes.criteria} />
      <List className={classes.list} data={finalData} />
    </div>
  );
};

export default OnlineLogsView;

function useConnect() {
  return {
    data: useSelector(getItems)
  };
}
