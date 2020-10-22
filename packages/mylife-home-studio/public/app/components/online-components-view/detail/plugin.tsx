import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { ConfigItem } from '../../../../../shared/component-model';
import { AppState } from '../../../store/types';
import { getPlugin } from '../../../store/online-components-view/selectors';
import { StateIcon, ActionIcon, ConfigIcon } from '../../lib/icons';
import { Title, SectionDivider, SectionTitle, Item, Count, NameValue } from './layout';

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const plugin = useSelector((state: AppState) => getPlugin(state, id));
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

      {Object.entries(plugin.config).map(([name, item]) => (
        <ConfigItem key={name} name={name} item={item} />
      ))}

      <SectionDivider />

      <SectionTitle icon={StateIcon} value='États' />

      <Item value='TODO' />

      <SectionDivider />

      <SectionTitle icon={ActionIcon}  value='Actions' />

      <Item value='TODO' />

      <SectionDivider />

      <Count value={plugin.components.length} singular='component' plural='components' />
    </Box>
  );
};

export default Plugin;

const ConfigItem: FunctionComponent<{ name: string, item: ConfigItem }> = ({ name, item }) => {
  let value = item.valueType as string;
  if (item.description) {
    value += ` (${item.description})`;
  }

  return (
    <NameValue name={name} value={value} />
  )
}