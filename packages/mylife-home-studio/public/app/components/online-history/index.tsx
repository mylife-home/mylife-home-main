import React, { FunctionComponent, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { AppState } from '../../store/types';
import { CriteriaDefinition } from '../../store/online-history/types';
import { makeGetFilteredItemsIds } from '../../store/online-history/selectors';
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

const defaultCriteria: CriteriaDefinition = {
  types: null,
  instance: null,
  component: null,
  state: null,
};

const OnlineHistory: FunctionComponent = () => {
  const classes = useStyles();
  const [criteria, setCriteria] = useState(defaultCriteria);
  const itemsIds = useData(criteria);

  return (
    <div className={classes.container}>
      <Criteria className={classes.criteria} criteria={criteria} setCriteria={setCriteria} />
      <List className={classes.list} itemsIds={itemsIds} />
    </div>
  );
};

export default OnlineHistory;

function useData(criteria: CriteriaDefinition) {
  const getFilteredItemsIds = useMemo(() => makeGetFilteredItemsIds(), []);
  return useSelector((state: AppState) => getFilteredItemsIds(state, criteria));
}
