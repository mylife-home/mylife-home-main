import React, { FunctionComponent, useMemo } from 'react';
import Box from '@material-ui/core/Box';

import { ControlDisplayMapItem } from '../../../../../../../shared/ui-model';
import { useComponentStyles } from '../../common/properties-layout';
import { parseType, Range, Enum } from './member-types';

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

  switch (type.name) {
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
      return <Unhandled reason={`Non supporté : ${type.name}`} />;
  }
};

export default TypeEditor;

function useType(value: string) {
  return useMemo(() => (value ? parseType(value) : null), [value]);
}

const Unhandled: FunctionComponent<{ reason: string }> = ({ reason }) => (
  <Box fontStyle="italic">({reason})</Box>
);

const RangeEditor: FunctionComponent<ItemProps & { min: number; max: number }> = ({ item, onChange }) => {
  const classes = useComponentStyles();
  return <>RangeEditor</>;
};

const TextEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  const classes = useComponentStyles();
  return <>TextEditor</>;
};

const FloatEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  const classes = useComponentStyles();
  return <>FloatEditor</>;
};

const BoolEditor: FunctionComponent<ItemProps> = ({ item, onChange }) => {
  const classes = useComponentStyles();
  return <>BoolEditor</>;
};

const EnumEditor: FunctionComponent<ItemProps & { options: string[] }> = ({ options, item, onChange }) => {
  const classes = useComponentStyles();
  return <>EnumEditor</>;
};
