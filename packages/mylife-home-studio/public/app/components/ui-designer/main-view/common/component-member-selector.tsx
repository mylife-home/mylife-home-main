import React, { FunctionComponent, useMemo } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { MemberType } from '../../../../../../shared/component-model';
import { makeGetComponentsAndPlugins } from '../../../../store/ui-designer/selectors';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useComponentStyles } from './properties-layout';

export interface ComponentAndMember {
  component: string;
  member: string;
}

interface Option extends ComponentAndMember {
  type: string;  
}

export interface ComponentMemberSelectorProps {
  nullable?: boolean;
  memberType: MemberType;
  value: ComponentAndMember;
  onChange: (value: ComponentAndMember) => void;
}

const ComponentMemberSelector: FunctionComponent<ComponentMemberSelectorProps> = ({ nullable = false, memberType, value, onChange }) => {
  const classes = useComponentStyles();
  const options = useOptions(memberType);

  return (
    <Autocomplete
      disableClearable={!nullable}
      className={classes.component}
      options={options}
      getOptionLabel={(option: Option) => `${option.component}.${option.member}`}
      renderOption={(option: Option) => <OptionDisplay option={option} />}
      getOptionSelected={getOptionSelected}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      value={trimInput(value)}
      onChange={(event: any, newValue: ComponentAndMember) => {
        onChange(formatOutput(newValue));
      }}
    />
  );
};

export default ComponentMemberSelector;

const OptionDisplay: FunctionComponent<{ option: Option }> = ({ option }) => (
  <>
    <span style={{flex: 1}}>{`${option.component}.${option.member}`}</span>
    <Typography variant="overline">{option.type}</Typography>
  </>
);

function useOptions(memberType: MemberType) {
  const getComponentsAndPlugins = useMemo(() => makeGetComponentsAndPlugins(), []);
  const componentsAndPlugins = useTabSelector(getComponentsAndPlugins);

  return useMemo(() => {
    const list: Option[] = [];

    for (const { component, plugin } of componentsAndPlugins) {
      for (const [name, member] of Object.entries(plugin.members)) {
        if (member.memberType === memberType) {
          list.push({ component: component.id, member: name, type: member.valueType });
        }
      }
    }

    return list;

  }, [componentsAndPlugins, memberType]);
}

function getOptionSelected(option: Option, value: ComponentAndMember) {
  if (!option && !value) {
    return true;
  }

  if (!option || !value) {
    return false;
  }

  return option.component === value.component && option.member === value.member;
}

// Because of its storage in the model, values are always provided/expected, but can contain null values if unset.

function trimInput(value: ComponentAndMember) {
  return value && value.component && value.member ? value : null;
}

function formatOutput(value: ComponentAndMember) {
  return value || { component: null, member: null };
}