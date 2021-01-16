import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/javascript/javascript.js';

import React, { FunctionComponent } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { EditorConfiguration } from 'codemirror';

const options: EditorConfiguration = {
  mode: 'javascript',
  theme: 'xq-light',
  lineNumbers: true
}

const CodeEditor: FunctionComponent<{ value: string; onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  return (
    <CodeMirror options={options} value={value} onChange={(editor, data, value) => onChange(value)} />
  );
};

export default CodeEditor;