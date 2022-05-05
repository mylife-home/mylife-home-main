import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';

import React, { FunctionComponent } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { EditorConfiguration } from 'codemirror';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  component: {
    fontSize: 12,

    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
}), { name: 'properties-code-editor'});

const options: EditorConfiguration = {
  mode: { name: 'javascript', json: true },
  theme: 'default',
  lineNumbers: true,
};

const JssEditor: FunctionComponent<{ value: string; onChange?: (newValue: string) => void; }> = ({ value, onChange }) => {
  const classes = useStyles();

  const finalOptions = { ...options, readonly: !onChange};

  return (
    <CodeMirror
      editorDidMount={editor => { editor.setSize('100%', '100%'); }}
      className={classes.component}
      options={finalOptions}
      value={value}
      onBeforeChange={onChange && ((editor, data, value) => onChange(value))}
    />
  );
};

export default JssEditor;