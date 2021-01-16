import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';

import React, { FunctionComponent } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { EditorConfiguration } from 'codemirror';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  component: {
    fontSize: 12,
  },
}), { name: 'properties-code-editor'});

const options: EditorConfiguration = {
  mode: 'javascript',
  theme: 'default',
  lineNumbers: true,
}

const CodeEditor: FunctionComponent<{ value: string; onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  const classes = useStyles();
  return (
    <CodeMirror className={classes.component} options={options} value={value} onBeforeChange={(editor, data, value) => onChange(value)} />
  );
};

export default CodeEditor;