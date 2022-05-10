import React, { FunctionComponent, useMemo } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { parseType, Range, Enum } from '../../../../lib/member-types';

export interface TestValueEditorProps {
  className?: string;
  valueType: string;
  value: any;
  onChange: (newValue: any) => void;
}

const TestValueEditor: FunctionComponent<TestValueEditorProps> = ({ className, valueType, value, onChange }) => {
  const type = useType(valueType);

  switch (type.typeId) {
    case 'range': {
      const rangeType = type as Range;
      return (
        <TextField
          className={className}
          value={formatNumber(value)}
          onChange={(e) => onChange(parseNumber(e.target.value, 'int'))}
          type="number"
          inputProps={{ min: rangeType.min, max: rangeType.max }}
        />
      );
    }

    case 'text':
      return (
        <TextField
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'float':
      return (
        <TextField
          className={className}
          value={formatNumber(value)}
          onChange={(e) => onChange(parseNumber(e.target.value, 'float'))}
          type="number"
        />
      );

    case 'bool':
      // avoid full width for checkbox
      return (
        <div className={className}>
          <FormControl>
            <Checkbox
              color="primary"
              indeterminate={value === null}
              checked={(value as boolean) || false}
              onChange={() => onChange(nextBoolValue(value))}
            />
          </FormControl>
        </div>
      );

    case 'enum': {
      const enumType = type as Enum;
      return (
        <Select className={className} value={value} onChange={e => onChange(e.target.value)}>
          {enumType.values.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      );
    }

    case 'complex':
      return (
        <TextField
          className={className}
          value={formatComplex(value)}
          onChange={(e) => onChange(parseComplex(e.target.value))}
        />
      );

    default:
      throw new Error(`Unsupported type: ${type.typeId}`)
  }
};

export default TestValueEditor;

function useType(value: string) {
  return useMemo(() => (value ? parseType(value) : null), [value]);
}

function nextBoolValue(actualValue: boolean) {
  switch (actualValue) {
    case null:
      return true;
    case true:
      return false;
    case false:
      return null;
  }
}

function formatNumber(value: number) {
  return value === null ? '' : value.toString(10);
}

function parseNumber(value: string, type: 'float' | 'int') {
  const number = type === 'float' ? parseFloat(value) : parseInt(value, 10);
  return isNaN(number) ? null : number;
}

function formatComplex(value: any) {
  return value === null ? '' : JSON.stringify(value);
}

function parseComplex(value: string) {
  try {
    return JSON.parse(value);
  } catch(err) {
    console.log('Error parsing JSON', err);
    return null;
  }
}
