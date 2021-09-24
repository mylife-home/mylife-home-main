import React, { FunctionComponent, useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { executeComponentAction } from '../../../store/online-components-view/actions';
import { useReportError } from '../../lib/use-error-handling';
import { parseType, Type, Range, Enum } from '../../lib/member-types';

const useStyles = makeStyles( (theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flext-start',
  },
  editor: {
    width: '200px',
  },
}), { name: 'execute-component-action' });

const ExecuteComponentAction: FunctionComponent<{ componentId: string; action: string; valueType: string }> = ({ componentId, action, valueType }) => {
  const execute = useActionConnect(componentId, action);
  const type = useMemo(() => parseType(valueType), [valueType]);
  const uniqueId = `${componentId}.${action}`;

  switch (type.typeId) {
    case 'bool':
      return <BoolEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    case 'range':
      return <RangeEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    case 'float':
      return <FloatEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    case 'text':
      return <TextEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    case 'complex':
      return <ComplexEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    case 'enum':
      return <EnumEditor uniqueId={uniqueId} type={type} onExecute={execute} />;

    default:
      // Unhandled case, no execution possible => do not show anything.
      return null;
  }
};

export default ExecuteComponentAction;

function useActionConnect(componentId: string, action: string) {
  const dispatch = useDispatch();
  return useCallback((value: any) => dispatch(executeComponentAction({ componentId, action, value })), [dispatch, componentId, action]);
}

interface EditorProps {
  uniqueId: string; // Identifier to know when the component is showing a different control (and reset its state)
  type: Type;
  onExecute: (value: any) => void;
}

const ExecuteButton: FunctionComponent<{ onClick: () => void }> = ({ onClick }) => (
  <Tooltip title="Executer l'action sur le composant">
    <IconButton onClick={onClick}>
      <FlashOnIcon />
    </IconButton>
  </Tooltip>
);

const BoolEditor: FunctionComponent<EditorProps> = ({ uniqueId, onExecute }) => {
  const [value, setValue] = useState(false);
  useEffect(() => setValue(false), [uniqueId]);

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <FormControl className={classes.editor}>
        <Checkbox color="primary" checked={value} onChange={() => setValue(!value)} />
      </FormControl>
      <ExecuteButton onClick={() => onExecute(value)} />
    </div>
  );
};

const RangeEditor: FunctionComponent<EditorProps> = ({ uniqueId, type, onExecute }) => {
  const onError = useReportError();
  const [value, setValue] = useState('');
  useEffect(() => setValue(''), [uniqueId]);
  const range = type as Range;

  const execute = () => {
    const rangeValue = Number.parseInt(value, 10);
    try {
      if (isNaN(rangeValue) || rangeValue < range.min || rangeValue > range.max) {
        throw new Error('Range invalide.');
      }
    } catch (err) {
      onError(err);
      return;
    }

    onExecute(rangeValue);
  };

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <TextField className={classes.editor} value={value} onChange={(e) => setValue(e.target.value)} type="number" inputProps={{ step: 1, min: range.min, max: range.max }} />
      <ExecuteButton onClick={execute} />
    </div>
  );
};

const FloatEditor: FunctionComponent<EditorProps> = ({ uniqueId, onExecute }) => {
  const onError = useReportError();
  const [value, setValue] = useState('');
  useEffect(() => setValue(''), [uniqueId]);

  const execute = () => {
    const floatValue = Number.parseFloat(value);
    try {
      if (isNaN(floatValue)) {
        throw new Error('Nombre invalide.');
      }
    } catch (err) {
      onError(err);
      return;
    }

    onExecute(floatValue);
  };

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <TextField className={classes.editor} value={value} onChange={(e) => setValue(e.target.value)} type="number" />
      <ExecuteButton onClick={execute} />
    </div>
  );
};

const TextEditor: FunctionComponent<EditorProps> = ({ uniqueId, onExecute }) => {
  const [value, setValue] = useState('');
  useEffect(() => setValue(''), [uniqueId]);

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <TextField className={classes.editor} value={value} onChange={(e) => setValue(e.target.value)} type="text" />
      <ExecuteButton onClick={() => onExecute(value)} />
    </div>
  );
};

const ComplexEditor: FunctionComponent<EditorProps> = ({ uniqueId, onExecute }) => {
  const onError = useReportError();
  const [value, setValue] = useState('');
  useEffect(() => setValue(''), [uniqueId]);

  const execute = () => {
    let complexValue: any;
    try {
      complexValue = JSON.parse(value);
    } catch (err) {
      err.message = 'Valeur complexe invalide : ' + err.message; 
      onError(err);
      return;
    }

    onExecute(complexValue);
  };

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <TextField className={classes.editor} value={value} onChange={(e) => setValue(e.target.value)} type="text" />
      <ExecuteButton onClick={execute} />
    </div>
  );
};

const EnumEditor: FunctionComponent<EditorProps> = ({ uniqueId, type, onExecute }) => {
  const onError = useReportError();
  const [value, setValue] = useState('');
  useEffect(() => setValue(''), [uniqueId]);
  const enumType = type as Enum;

  const execute = () => {
    try {
      if(!enumType.values.includes(value)) {
        throw new Error('Valeur invalide.');
      }
    } catch (err) {
      err.message = 'Valeur complexe invalide : ' + err.message; 
      onError(err);
      return;
    }

    onExecute(value);
  };

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Select className={classes.editor} value={value} onChange={(e: React.ChangeEvent<{ value: unknown }>) => setValue(e.target.value as string)}>
        {enumType.values.map((value) => (
          <MenuItem key={value} value={value}>{value}</MenuItem>
        ))}
      </Select>
      <ExecuteButton onClick={execute} />
    </div>
  );
};