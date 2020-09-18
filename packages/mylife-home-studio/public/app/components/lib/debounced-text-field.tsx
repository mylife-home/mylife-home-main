import React, { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import TextField, { StandardTextFieldProps } from '@material-ui/core/TextField';
import { useDebounced } from './use-debounced';

// https://gist.github.com/krambertech/76afec49d7508e89e028fce14894724c
const ENTER_KEY = 13;

type DebouncedTextFieldProps = Omit<StandardTextFieldProps, 'value' | 'onChange'> & { value? : string, onChange: (arg: string) => void };

const DebouncedTextField: FunctionComponent<DebouncedTextFieldProps> = ({ value, onChange, ...props }) => {
  const { componentValue, componentChange, flush } = useDebounced(value, onChange);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    componentChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === ENTER_KEY) {
      flush();
    }
  };

  return (
    <TextField {...props} value={componentValue || ''} onChange={handleChange} onKeyDown={handleKeyDown} />
  );
};

export default DebouncedTextField;
