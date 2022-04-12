import React, { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { Group, Item } from '../../../lib/properties-layout';
import Actions from './actions';
import Configuration from './configuration';
import Members from './members';
import { useComponentData } from './common';
import { AppState } from '../../../../store/types';
import { getInstance, getPlugin, getTemplate } from '../../../../store/core-designer/selectors';
import { ComponentDefinition } from '../../../../store/core-designer/types';

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { component } = useComponentData();

  return (
    <div className={className}>
      <Group title={component.componentId}>
        <Actions />
        <DefinitionLayout definition={component.definition} />
      </Group>

      <Configuration />
      <Members />
    </div>
  );
};

export default Component;

const DefinitionLayout: FunctionComponent<{ definition: ComponentDefinition; }> = ({ definition }) => {
  switch (definition.type) {
    case 'plugin':
      return (
        <PluginLayout id={definition.id} />
      );

    case 'template':
      return (
        <TemplateLayout id={definition.id} />
      );
  }
};

const TemplateLayout: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useSelector(useCallback((state: AppState) => getTemplate(state, id), [id]));

  return (
    <Item title="Template">
      <Typography>{template.templateId}</Typography>
    </Item>
  );
};

const PluginLayout: FunctionComponent<{ id: string; }> = ({ id }) => {
  const plugin = useSelector(useCallback((state: AppState) => getPlugin(state, id), [id]));
  const instance = useSelector(useCallback((state: AppState) => getInstance(state, plugin.instance), [plugin.instance]));

  return (
    <>
      <Item title="Instance">
        <Typography>{instance.instanceName}</Typography>
      </Item>

      <Item title="Plugin" multiline>
        <Typography>{`${plugin.module}.${plugin.name}`}</Typography>
        <Typography color="textSecondary">{plugin.description}</Typography>
      </Item>
    </>
  );
};