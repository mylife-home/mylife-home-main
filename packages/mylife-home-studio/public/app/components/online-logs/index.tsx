import React, { FunctionComponent, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import matcher from 'matcher';

import { getItems } from '../../store/online-logs/selectors';
import Criteria, { CriteriaDefinition } from './criteria';
import Console from './console';
import Table from './table';

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
  name: null,
  instance: null,
  message: null,
  error: null,
  levelMin: null,
  levelMax: null,
  display: 'console',
};

const OnlineLogs: FunctionComponent = () => {
  const classes = useStyles();
  const [criteria, setCriteria] = useState(defaultCriteria);
  const data = useData(criteria);

  return (
    <div className={classes.container}>
      <Criteria className={classes.criteria} criteria={criteria} setCriteria={setCriteria} />

      {criteria.display === 'console' && (
        <Console className={classes.list} data={data} />
      )}

      {criteria.display === 'table' && (
        <Table className={classes.list} data={data} />
      )}
    </div>
  );
};

export default OnlineLogs;

function useConnect() {
  return {
    data: useSelector(getItems)
  };
}

function useData(criteria: CriteriaDefinition) {
  const { data } = useConnect();

  return useMemo(() => {
    let items = data;

    if (criteria.name) {
      items = items.filter(item => matcher.isMatch(item.name, criteria.name));
    }

    if (criteria.instance) {
      items = items.filter(item => matcher.isMatch(item.instanceName, criteria.instance));
    }

    if (criteria.message) {
      items = items.filter(item => matcher.isMatch(item.msg, criteria.message));
    }
    
    if (criteria.error !== null) {
      items = items.filter(item => !!item.err === criteria.error);
    }

    if (criteria.levelMin !== null) {
      items = items.filter(item => item.level >= criteria.levelMin);
    }

    if (criteria.levelMax !== null) {
      items = items.filter(item => item.level <= criteria.levelMax);
    }

    return items;
  }, [data, criteria]);
}
