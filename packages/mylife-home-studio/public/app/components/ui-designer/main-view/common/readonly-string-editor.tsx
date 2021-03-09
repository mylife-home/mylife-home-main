import React, { FunctionComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import { useComponentStyles } from '../../../lib/properties-layout';

export interface ReadonlyStringEditorProps {
  value: string;
}

const ReadonlyStringEditor: FunctionComponent<ReadonlyStringEditorProps> = ({ value }) => {
  const classes = useComponentStyles();
  return (
    <TextField
      disabled
      className={classes.component}
      value={value || ''}
      onChange={() => {}}
    />
  );
}

export default ReadonlyStringEditor;
