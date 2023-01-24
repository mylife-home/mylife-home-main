import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import DebouncedTextField from '../lib/debounced-text-field';
import LevelSelector from './level-selector';

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

export type CriteriaDisplay = 'console' | 'table';

export interface CriteriaDefinition {
  name: string;
  instance: string;
  message: string;
  error: boolean;
  levelMin: number;
  levelMax: number;
  display: CriteriaDisplay;
}

type SetCriteria = (updater: (prevState: CriteriaDefinition) => CriteriaDefinition) => void;

interface CriteriaProps {
  className?: string;
  criteria: CriteriaDefinition;
  setCriteria: SetCriteria;
}

const Criteria: FunctionComponent<CriteriaProps> = ({ className, criteria, setCriteria }) => {
  const classes = useStyles();

  const [name, setName] = useTextValue(criteria, setCriteria, 'name');
  const [instance, setInstance] = useTextValue(criteria, setCriteria, 'instance');
  const [message, setMessage] = useTextValue(criteria, setCriteria, 'message');
  const [errorChecked, errorIndeterminate, changeError] = useCheckboxValue(criteria, setCriteria, 'error');
  const [levelMin, setMinLevel] = useLevelMinValue(criteria, setCriteria);
  const [levelMax, setMaxLevel] = useLevelMaxValue(criteria, setCriteria);
  const [display, setDisplay] = useDisplayValue(criteria, setCriteria);

  return (
    <div className={clsx(classes.container, className)}>
      <DebouncedTextField label='Nom' className={classes.name} value={name} onChange={setName} />
      <DebouncedTextField label='Instance' className={classes.instance} value={instance} onChange={setInstance} />
      <DebouncedTextField label='Message' className={classes.message} value={message} onChange={setMessage} />
      <LevelSelector label='Niveau min' className={classes.level} value={levelMin} onChange={setMinLevel} />
      <LevelSelector label='Niveau max' className={classes.level} value={levelMax} onChange={setMaxLevel} />
      <FormControlLabel label='Contient une erreur' control={<Checkbox color='primary' checked={errorChecked} indeterminate={errorIndeterminate} onChange={changeError}/>} />

      <RadioGroup row value={display} onChange={event => setDisplay(event.target.value as CriteriaDisplay)}>
        <FormControlLabel value="console" control={<Radio color="primary" />} label="Console" />
        <FormControlLabel value="table" control={<Radio color="primary" />} label="Table" />
      </RadioGroup>
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

function useCheckboxValue(criteria: CriteriaDefinition, setCriteria: SetCriteria, key: keyof CriteriaDefinition): [boolean, boolean, () => void] {
  const changeValue = useCallback(() => setCriteria(prevState => ({ ...prevState, [key]: getTriStateNext(prevState[key] as boolean) })), [setCriteria, key]);
  const value = criteria[key] as boolean;
  const checked = value === true;
  const indeterminate = value === null;
  return [checked, indeterminate, changeValue];
}

function getTriStateNext(value: boolean) {
  switch(value) {
    case null:
      return true;
    case true:
      return false;
    case false:
      return null;
  }
}

function useLevelMinValue(criteria: CriteriaDefinition, setCriteria: SetCriteria): [number, (newValue: number) => void] {
  const setValue = useCallback((levelMin: number) => {
    setCriteria(prevState => ({ ...prevState, levelMin, levelMax: computeNewMax(prevState.levelMax, levelMin) }));
  }, [setCriteria]);
  return [criteria.levelMin, setValue];
}

function useLevelMaxValue(criteria: CriteriaDefinition, setCriteria: SetCriteria): [number, (newValue: number) => void] {
  const setValue = useCallback((levelMax: number) => {
    setCriteria(prevState => ({ ...prevState, levelMin: computeNewMin(prevState.levelMin, levelMax), levelMax }));
  }, [setCriteria]);
  return [criteria.levelMax, setValue];
}

function computeNewMax(prevMax: number, newMin: number) {
  return prevMax === null || newMin === null || prevMax >= newMin ? prevMax : newMin;
}

function computeNewMin(prevMin: number, newMax: number) {
  return prevMin === null || newMax === null || prevMin <= newMax ? prevMin : newMax;
}

function useDisplayValue(criteria: CriteriaDefinition, setCriteria: SetCriteria): [CriteriaDisplay, (newValue: CriteriaDisplay) => void] {
  const changeValue = useCallback((newValue: CriteriaDisplay) => {
    setCriteria(prevState => ({ ...prevState, display: newValue || null }));
  }, [setCriteria]);

  return [criteria.display, changeValue];
}