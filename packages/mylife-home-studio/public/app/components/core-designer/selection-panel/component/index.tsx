import React, { FunctionComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import { Group, Item } from '../../../lib/properties-layout';
import Actions from './actions';
import Configuration from './configuration';
import Members from './members';
import { useComponentData } from './common';

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { component, plugin } = useComponentData();

  return (
    <div className={className}>
      <Group title={component.id}>
        <Actions />

        <Item title="Instance">
          <Typography>{plugin.instanceName}</Typography>
        </Item>

        <Item title="Plugin" multiline>
          <Typography>{`${plugin.module}.${plugin.name}`}</Typography>
          <Typography color="textSecondary">{plugin.description}</Typography>
        </Item>
      </Group>

      <Configuration />
      <Members />
    </div>
  );
};

export default Component;
