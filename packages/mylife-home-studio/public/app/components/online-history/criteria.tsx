import React, { FunctionComponent, useCallback } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import DebouncedTextField from '../lib/debounced-text-field';
import { CriteriaDefinition } from '../../store/online-history/types';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',

    '& > *': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
    },
  },
  name: {
    width: '50ch',
  },
  instance: {
    width: '25ch',
  },
  message: {
    width: '50ch',
  },
  level: {
    width: '12ch'
  }
}));

type SetCriteria = (updater: (prevState: CriteriaDefinition) => CriteriaDefinition) => void;

interface CriteriaProps {
  className?: string;
  criteria: CriteriaDefinition;
  setCriteria: SetCriteria;
}

const Criteria: FunctionComponent<CriteriaProps> = ({ className, criteria, setCriteria }) => {
  const classes = useStyles();

  const [instance, setInstance] = useTextValue(criteria, setCriteria, 'instance');
  const [component, setComponent] = useTextValue(criteria, setCriteria, 'component');
  const [state, setState] = useTextValue(criteria, setCriteria, 'state');

  return (
    <div className={clsx(classes.container, className)}>
      {/* TODO: types */}
      <DebouncedTextField label='Instance' className={classes.instance} value={instance} onChange={setInstance} />
      <DebouncedTextField label='Component' className={classes.name} value={component} onChange={setComponent} />
      <DebouncedTextField label='État' className={classes.name} value={state} onChange={setState} />
    </div>
  );
};

export default Criteria;

function useTextValue(criteria: CriteriaDefinition, setCriteria: SetCriteria, key: keyof CriteriaDefinition): [string, (newValue: string) => void] {
  const changeValue = useCallback((newValue: string) => {
    setCriteria(prevState => ({ ...prevState, [key]: newValue || null }));
  }, [setCriteria, key]);

  const value = criteria[key] as string || '';

  return [value, changeValue];
}
