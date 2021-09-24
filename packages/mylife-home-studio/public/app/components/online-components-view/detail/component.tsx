import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { ConfigItem, Plugin, Component } from '../../../store/online-components-view/types';
import { getPlugin, getComponent, getState } from '../../../store/online-components-view/selectors';
import { StateIcon, ActionIcon, ConfigIcon } from '../../lib/icons';
import { Title, SectionDivider, SectionTitle, Item, Count, NameValue } from './layout';
import ExecuteComponentAction from './execute-component-action';

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const component = useSelector((state: AppState) => getComponent(state, id));
  const plugin = useSelector((state: AppState) => getPlugin(state, component.plugin));

  return (
    <Box p={3}>
      <Title type="component" title={component.display} />

      <NameValue name="ID" value={component.display} />
      <NameValue name="Plugin" value={plugin.display} />
      <NameValue name="Utilisation" value={plugin.usage} />
      <NameValue name="Instance" value={component.instance} />
      <NameValue name="Plugin version" value={plugin.version} />

      <SectionDivider />

      <SectionTitle icon={ConfigIcon} value="Configuration" />

      {plugin.configIds.map((id) => (
        <ConfigItem key={id} component={component} plugin={plugin} id={id} />
      ))}

      <SectionDivider />

      <SectionTitle icon={StateIcon} value="États" />

      {plugin.stateIds.map((id) => (
        <StateItem key={id} component={component} plugin={plugin} id={id} />
      ))}

      <SectionDivider />

      <SectionTitle icon={ActionIcon} value="Actions" />

      {plugin.actionIds.map((id) => (
        <ActionItem key={id} component={component} plugin={plugin} id={id} />
      ))}

      <SectionDivider />

      <Count value={plugin.components.length} singular="component" plural="components" />
    </Box>
  );
};

export default Component;

const ConfigItem: FunctionComponent<{ component: Component; plugin: Plugin; id: string }> = ({ component, plugin, id }) => {
  const item = plugin.config[id];
  return <NameValue name={id} value={`<unknown> (${item.valueType})`} />;
};

const StateItem: FunctionComponent<{ component: Component; plugin: Plugin; id: string }> = ({ component, plugin, id }) => {
  const state = useSelector((state: AppState) => getState(state, `${component.id}:${id}`));
  const item = plugin.members[id];
  return <NameValue name={id} value={` ${JSON.stringify(state.value)} (${item.valueType})`} />;
};

const ActionItem: FunctionComponent<{ component: Component; plugin: Plugin; id: string }> = ({ component, plugin, id }) => {
  const item = plugin.members[id];

  return (
    <>
      <NameValue name={id} value={` (${item.valueType})`} />
      <ExecuteComponentAction componentId={component.display} action={id} valueType={item.valueType} />
    </>
  );
};