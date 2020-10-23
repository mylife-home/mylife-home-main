import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getPlugin, getComponent, getState } from '../../../store/online-components-view/selectors';
import { ComponentIcon, PluginIcon, StateIcon } from '../../lib/icons';
import { Title, SectionDivider, SectionTitle, NameValue } from './layout';

const State: FunctionComponent<{ id: string }> = ({ id }) => {
  const state = useSelector((state: AppState) => getState(state, id));
  console.log(state);
  const component = useSelector((appState: AppState) => getComponent(appState, state.component));
  const plugin = useSelector((appState: AppState) => getPlugin(appState, component.plugin));
  const member = plugin.members[state.name];

  return (
    <Box p={3}>
      <Title type='state' title={state.name} />

      <SectionTitle icon={ComponentIcon} value="Composant" />

      <NameValue name="ID" value={component.display} />
      <NameValue name="Instance" value={component.instance} />

      <SectionDivider />

      <SectionTitle icon={PluginIcon} value="Plugin" />

      <NameValue name="Nom" value={plugin.display} />
      <NameValue name="Utilisation" value={plugin.usage} />
      <NameValue name="Version" value={plugin.version} />
      <NameValue name="Description" value={plugin.description} />

      <SectionDivider />

      <SectionTitle icon={StateIcon} value="Etat" />

      <NameValue name="Nom" value={state.name} />
      <NameValue name="Valeur" value={JSON.stringify(state.value)} />
      <NameValue name="Type" value={member.valueType} />
      <NameValue name="Description" value={member.description} />
    </Box>
  );
};

export default State;
