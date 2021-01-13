import React, { FunctionComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import { useComponentStyles } from './properties-layout';

export interface StringEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const StringEditor: FunctionComponent<StringEditorProps> = ({ value, onChange }) => {
  const classes = useComponentStyles();
  return (
    <TextField
      className={classes.component}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

export default StringEditor;
