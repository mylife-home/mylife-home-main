import React, { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { Group, Item } from '../../../lib/properties-layout';
import Actions from './actions';
import Configuration from './configuration';
import Members from './members';
import { useComponentData } from './common';
import { AppState } from '../../../../store/types';
import { getInstance } from '../../../../store/core-designer/selectors';

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { component, plugin } = useComponentData();
  const instance = useSelector(useCallback((state: AppState) => getInstance(state, plugin.instance), [plugin.instance]));

  return (
    <div className={className}>
      <Group title={component.id}>
        <Actions />

        <Item title="Instance">
          <Typography>{instance.instanceName}</Typography>
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
