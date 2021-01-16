import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';

import React, { FunctionComponent } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { EditorConfiguration } from 'codemirror';

const options: EditorConfiguration = {
  mode: 'javascript',
  theme: 'default',
  lineNumbers: true,
}

const CodeEditor: FunctionComponent<{ value: string; onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  return (
    <CodeMirror options={options} value={value} onBeforeChange={(editor, data, value) => onChange(value)} />
  );
};

export default CodeEditor;