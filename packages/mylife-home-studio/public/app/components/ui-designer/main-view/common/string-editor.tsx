import React, { FunctionComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import { useComponentStyles } from './properties-layout';

export interface StringEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

const StringEditor: FunctionComponent<StringEditorProps> = ({ value, onChange, rows }) => {
  const classes = useComponentStyles();
  return (
    <TextField
      multiline={!!rows}
      rows={rows}
      className={classes.component}
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
    />
  );
}

export default StringEditor;
