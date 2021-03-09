import React, { FunctionComponent, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/core/Slider';

import { ControlDisplayMapItem } from '../../../../../../../shared/ui-model';
import { useComponentStyles } from '../../../../lib/properties-layout';
import StringEditor from '../../common/string-editor';
import { parseType, Range, Enum } from './member-types';

const useStyles = makeStyles((theme) => ({
  floatEditorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '& > *': {
      flex: 1,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    }
  },
}), { name: 'properties-type-editor' });


interface ItemProps {
  item: ControlDisplayMapItem;
  onChange: (props: Partial<ControlDisplayMapItem>) => void;
}

export interface TypeEditorProps extends ItemProps {
  valueType: string;
}

const TypeEditor: FunctionComponent<TypeEditorProps> = ({ valueType, ...itemProps }) => {
  const type = useType(valueType);

  if (!type) {
    return <Unhandled reason="Sélectionner un composant" />;
  }

  switch (type.typeId) {
    case 'range': {
      const rangeType = type as Range;
      return <RangeEditor min={rangeType.min} max={rangeType.max} {...itemProps} />;
    }

    case 'text':
      return <TextEditor {...itemProps} />;

    case 'float':
      return <FloatEditor {...itemProps} />;

    case 'bool':
      return <BoolEditor {...itemProps} />;

    case 'enum': {
      const enumType = type as Enum;
      return <EnumEditor options={enumType.values} {...itemProps} />;
    }

    //case 'complex':
    default:
      return <Unhandled reason={`Non supporté : ${type.typeId}`} />;
  }
};

export default TypeEditor;

function useType(value: string) {
  return useMemo(() => (value ? parseType(value) : null), [value]);
}

const Unhandled: FunctionComponent<{ reason: string }> = ({ reason }) => {
  const classes = useComponentStyles();
  return (
    <Box fontStyle="italic" className={classes.component}>
      ({reason})
    </Box>
  );
};

const RangeEditor: FunctionComponent<ItemProps & { min: number; max: number }> = ({ item, onChange, min, max }) => {
  const componentClasses = useComponentStyles();
  const classes = useStyles();
  const onSliderChange = (event: React.ChangeEvent, newValue: number[]) => {
    const [min, max] = newValue;
    onChange({ min, max });
  };

  return (
    <div className={clsx(componentClasses.component, classes.floatEditorContainer)}>
      <TextField label="min" value={format(item.min)} onChange={(e) => onChange({ min: parse(e.target.value, 'int') })} type="number" inputProps={{ min, max }} />
      <TextField label="max" value={format(item.max)} onChange={(e) => onChange({ max: parse(e.target.value, 'int') })} type="number" inputProps={{ min, max }} />
      <Slider min={min} max={max} value={[item.min, item.max]} onChange={onSliderChange} />
    </div>
  );
};

const TextEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  return <StringEditor value={item.value as string} onChange={value => onChange({ value })} />;
};

const FloatEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  const componentClasses = useComponentStyles();
  const classes = useStyles();
  return (
    <div className={clsx(componentClasses.component, classes.floatEditorContainer)}>
      <TextField label="min" value={format(item.min)} onChange={(e) => onChange({ min: parse(e.target.value, 'float') })} type="number" />
      <TextField label="max" value={format(item.max)} onChange={(e) => onChange({ max: parse(e.target.value, 'float') })} type="number" />
    </div>
  );
};

const BoolEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  const classes = useComponentStyles();
  return (
    <FormControlLabel
      className={classes.component}
      label="Valeur"
      labelPlacement="start"
      control={<Checkbox color="primary" checked={(item.value as boolean) || false} onChange={(e) => onChange({ value: e.target.checked })} />}
    />
  );
};

const EnumEditor: FunctionComponent<ItemProps & { options: string[] }> = ({ options, item, onChange }) => {
  const classes = useComponentStyles();
  return (
    <Select className={classes.component} value={item.value as string} onChange={e => onChange({ value: e.target.value as string })}>
      {options.map(option => (
        <MenuItem key={option} value={option}>{option}</MenuItem>
      ))}
    </Select>
  );
};

function format(value: number) {
  return value === null ? '' : value.toString(10);
}

function parse(value: string, type: 'float' | 'int') {
  const number = type === 'float' ? parseFloat(value) : parseInt(value, 10);
  return isNaN(number) ? null : number;
}
