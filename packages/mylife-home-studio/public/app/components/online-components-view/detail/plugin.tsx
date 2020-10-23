import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { ConfigItem, Member, MemberType, Plugin } from '../../../../../shared/component-model';
import { AppState } from '../../../store/types';
import { getPlugin } from '../../../store/online-components-view/selectors';
import { StateIcon, ActionIcon, ConfigIcon } from '../../lib/icons';
import { Title, SectionDivider, SectionTitle, Item, Count, NameValue } from './layout';

type UiConfigItem = { name: string; } & ConfigItem;
type UiMember = { name: string; } & Omit<Member, 'memberType'>;

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const plugin = useSelector((state: AppState) => getPlugin(state, id));
  const { config, states, actions } = usePluginProps(plugin);
  return (
    <Box p={3}>
      <Title type='plugin' title={plugin.display} />

      <NameValue name='Nom' value={plugin.name} />
      <NameValue name='Module' value={plugin.module} />
      <NameValue name='Utilisation' value={plugin.usage} />
      <NameValue name='Instance' value={plugin.instance} />
      <NameValue name='Version' value={plugin.version} />
      <NameValue name='Description' value={plugin.description} />

      <SectionDivider />

      <SectionTitle icon={ConfigIcon} value='Configuration' />

      {config.map(configItem => (
        <ConfigItem key={configItem.name} configItem={configItem} />
      ))}

      <SectionDivider />

      <SectionTitle icon={StateIcon} value='États' />

      {states.map(member => (
        <MemberItem key={member.name} member={member} />
      ))}

      <SectionDivider />

      <SectionTitle icon={ActionIcon}  value='Actions' />

      {actions.map(member => (
        <MemberItem key={member.name} member={member} />
      ))}

      <SectionDivider />

      <Count value={plugin.components.length} singular='component' plural='components' />
    </Box>
  );
};

export default Plugin;

const ConfigItem: FunctionComponent<{ configItem: UiConfigItem }> = ({ configItem }) => {
  let value = configItem.valueType as string;
  if (configItem.description) {
    value += ` (${configItem.description})`;
  }

  return (
    <NameValue name={configItem.name} value={value} />
  )
}

const MemberItem: FunctionComponent<{ member: UiMember }> = ({ member }) => {
  let value = member.valueType as string;
  if (member.description) {
    value += ` (${member.description})`;
  }

  return (
    <NameValue name={member.name} value={value} />
  )
}

function usePluginProps(plugin: Plugin) {
  return useMemo(() => {
    const config: UiConfigItem[] = [];
    const states: UiMember[] = [];
    const actions: UiMember[] = [];

    for(const [name, item] of Object.entries(plugin.config)) {
      config.push({ name, ...item });
    }

    for(const [name, item] of Object.entries(plugin.members)) {
      switch(item.memberType) {
        case MemberType.STATE: {
          const { memberType: _, ... values } = item;
          states.push({ name, ...values });
          break;
        }

        case MemberType.ACTION: {
          const { memberType: _, ... values } = item;
          actions.push({ name, ...values });
          break;
        }
      }
    }

    return { config, states, actions };
  }, [plugin]);
}