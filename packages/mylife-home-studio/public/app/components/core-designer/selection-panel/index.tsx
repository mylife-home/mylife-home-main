import React, { FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import Component from './component';
import Binding from './binding';

import { useSelection } from '../selection';
import { getComponentIds } from '../../../store/core-designer/selectors';
import { useTabSelector } from '../../lib/use-tab-selector';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  display: {
    flex: 1,
  },
  componentSelector: {
    margin: theme.spacing(2),
  },
}), { name: 'selection-panel' });

const SelectionPanel: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      <ComponentSelector className={classes.componentSelector} />
      <DisplayDispatcher />
    </div>
  );
};

export default SelectionPanel;

const DisplayDispatcher: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selection } = useSelection();

  switch(selection?.type) {

    case 'component':
      return (
        <Component className={className} />
      );

    case 'binding':
      return (
        <Binding className={className} />
      );

    default:
      return null;
  }
}

const ComponentSelector: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { select } = useSelection();
  const componentsIds = useTabSelector(getComponentIds);

  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={null}
      onChange={(event, componentId) => {
        select({ type: 'component', id: componentId});
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={componentsIds}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Accès rapide"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};