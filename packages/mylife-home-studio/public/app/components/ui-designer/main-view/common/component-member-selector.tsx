import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { AppState } from '../../../../store/types';
import { Member, MemberType } from '../../../../../../shared/component-model';
import { UiTemplate } from '../../../../store/ui-designer/types';
import { makeGetComponentsAndPlugins, getComponentsMap, getComponent } from '../../../../store/ui-designer/selectors';
import { TemplateIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useComponentStyles } from '../../../lib/properties-layout';
import { useViewState } from '../view/view-state';

export interface ComponentAndMember {
  component: string; // maybe null in case of template export
  member: string;
}

export interface Option extends ComponentAndMember {
  type: string;
}

export interface ComponentMemberSelectorProps {
  nullable?: boolean;
  memberType: MemberType;
  filter?: (name: string, member: Member) => boolean;
  value: ComponentAndMember;
  onChange: (value: ComponentAndMember, memberType: string) => void;
}

const ComponentMemberSelector: FunctionComponent<ComponentMemberSelectorProps> = ({ nullable = false, memberType, filter = defaultFilter, value, onChange }) => {
  const classes = useComponentStyles();
  const options = useOptions(memberType, filter);
  const componentsMap = useSelector(getComponentsMap);

  const getOptionLabel = (option: Option) => {
    if (option.component) {
      return `${componentsMap[option.component].componentId}.${option.member}`;
    } else {
      return option.member + ' (export template)';
    }
  };

  return (
    <Autocomplete
      disableClearable={!nullable}
      className={classes.component}
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={(option: Option) => <OptionDisplay option={option} />}
      getOptionSelected={getOptionSelected}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      value={trimInput(value)}
      onChange={(event: any, newValue: Option) => {
        onChange(formatOutput(newValue), newValue?.type);
      }}
    />
  );
};

export default ComponentMemberSelector;

const useOptionStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(1),
  },
  text: {
    flex: 1
  },
}), { name: 'component-member-selector-options' });

const OptionDisplay: FunctionComponent<{ option: Option }> = ({ option }) => {
  const classes = useOptionStyles();
  const component = useSelector((state: AppState) => getComponent(state, option.component));
  const text = option.component ? `${component.componentId}.${option.member}` : option.member;

  return (
    <>
      {!component && (
        <TemplateIcon className={classes.icon} />
      )}
      <Typography className={classes.text}>{text}</Typography>
      <Typography variant="overline">{option.type}</Typography>
    </>
  );
};

function defaultFilter() {
  return true;
}

function useOptions(memberType: MemberType, filter: (name: string, member: Member) => boolean) {
  const getComponentsAndPlugins = useMemo(() => makeGetComponentsAndPlugins(), []);
  const componentsAndPlugins = useTabSelector(getComponentsAndPlugins);
  const { viewType, view } = useViewState();

  return useMemo(() => {
    const list: Option[] = [];

    if (viewType === 'template') {
      // Also add template exports
      const template = view as UiTemplate;

      for (const [name, exportData] of Object.entries(template.exports)) {
        if (exportData.memberType === memberType && filter(name, { ...exportData, description: null })) {
          list.push({ component: null, member: name, type: exportData.valueType });
        }
      }
    }

    for (const { component, plugin } of componentsAndPlugins) {
      for (const [name, member] of Object.entries(plugin.members)) {
        if (member.memberType === memberType && filter(name, member)) {
          list.push({ component: component.id, member: name, type: member.valueType });
        }
      }
    }

    return list;

  }, [componentsAndPlugins, memberType, filter]);
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
