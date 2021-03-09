import React, { FunctionComponent, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const QuickAccess: FunctionComponent<{ className?: string; list: string[]; onSelect: (id: string) => void; }> = ({ className, list, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={null}
      onChange={(event, id) => {
        onSelect(id);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
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

export default QuickAccess;