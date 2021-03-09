import React, { FunctionComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import { useComponentStyles } from '../../../lib/properties-layout';

export interface SnapedIntegerEditorProps {
  nullable?: boolean;
  snap: number;
  value: number;
  onChange: (value: number) => void;
}

const SnapedIntegerEditor: FunctionComponent<SnapedIntegerEditorProps> = ({ nullable = false, snap, value, onChange }) => {
  const classes = useComponentStyles();
  return (
    <TextField
      className={classes.component}
      value={format(value)}
      onChange={(e) => onChange(parse(e.target.value, nullable))}
      type="number"
      inputProps={{
        min: 0,
        step: snap,
      }}
    />
  );
}

export default SnapedIntegerEditor;

function format(value: number) {
  return value === null ? '' : value.toString(10);
}

function parse(value: string, nullable: boolean) {
  const number = parseInt(value, 10);
  if (!isNaN(number)) {
    return number;
  }
  return nullable ? null : 0;
}