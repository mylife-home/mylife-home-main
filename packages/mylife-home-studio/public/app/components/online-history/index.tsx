import React, { FunctionComponent, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import matcher from 'matcher';

import { getItems } from '../../store/online-history/selectors';
import Criteria, { CriteriaDefinition } from './criteria';
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

const defaultCriteria: CriteriaDefinition = {
  types: null,
  instance: null,
  component: null,
  state: null,
};

const OnlineHistory: FunctionComponent = () => {
  const classes = useStyles();
  const [criteria, setCriteria] = useState(defaultCriteria);
  const data = useData(criteria);

  return (
    <div className={classes.container}>
      <Criteria className={classes.criteria} criteria={criteria} setCriteria={setCriteria} />
      <List className={classes.list} data={data} />
    </div>
  );
};

export default OnlineHistory;

function useConnect() {
  return {
    data: useSelector(getItems)
  };
}

function useData(criteria: CriteriaDefinition) {
  const { data } = useConnect();

  return useMemo(() => {
    let items = data;

    // TODO: criteria
    /*
    if (criteria.instance) {
      items = items.filter(item => matcher.isMatch(item.instanceName, criteria.instance));
    }
    */

    return items.slice().reverse();
  }, [data, criteria]);
}
