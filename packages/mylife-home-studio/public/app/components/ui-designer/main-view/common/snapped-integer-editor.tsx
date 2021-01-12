import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useComponentStyles } from './properties-layout';

export interface SnapedIntegerEditorProps {
  nullable?: boolean;
  label?: string;
  snap: number;
  value: number;
  onChange: (value: number) => void;
}

const SnapedIntegerEditor: FunctionComponent<SnapedIntegerEditorProps> = ({ nullable = false, label, snap, value, onChange }) => {
  const classes = useComponentStyles();
  return (
    <TextField
      className={classes.component}
      value={format(value)}
      onChange={(e) => onChange(parse(e.target.value, nullable))}
      label={label}
      type="number"
      InputLabelProps={{
        shrink: true,
      }}
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