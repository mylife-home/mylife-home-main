import React, { FunctionComponent, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Item {
  id: string;
  label: string;
}

const QuickAccess: FunctionComponent<{ className?: string; list: Item[]; onSelect: (id: string) => void; }> = ({ className, list, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={null}
      onChange={(event, item) => {
        onSelect((item as Item).id);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(item) => item.label}
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