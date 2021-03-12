import React, { FunctionComponent } from 'react';

import { Group, Item } from '../../../lib/properties-layout';
import { useComponentData } from './common';

const Configuration: FunctionComponent = () => {
  const { component, plugin } = useComponentData();

  if(component.external) {
    return null;
  }

  return (
    <Group title="Configuration" collapse>
      {plugin.configIds.map((id => {
        const configItem = plugin.config[id];
        const configValue = component.config[id];

        return (
          <Item key={id} title={id}>
            {configItem.description}
            {configItem.valueType}
            {JSON.stringify(configValue)}
            TODO
          </Item>
        );
      }))}
    </Group>
  );
};

export default Configuration;
