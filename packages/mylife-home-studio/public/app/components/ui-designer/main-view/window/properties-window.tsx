import React, { FunctionComponent } from 'react';

import { useWindowState } from './window-state';
import { Group, Item } from '../common/properties-layout';
import SnappedIntegerEditor from '../common/snapped-integer-editor';
import ResourceSelector from '../common/resource-selector';

const PropertiesWindow: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { window, update } = useWindowState();

  return (
    <div className={className}>
      <Group title={"Fenêtre"}>
        <Item title={"Identifiant"}>
          TODO
        </Item>
        <Item title={"Largeur"}>
          <SnappedIntegerEditor snap={5} value={window.width} onChange={value => update({ width: value })} />
        </Item>
        <Item title={"Longueur"}>
          <SnappedIntegerEditor snap={5} value={window.height} onChange={value => update({ height: value })} />
        </Item>
        <Item title={"Arrière-plan"}>
          <ResourceSelector value={window.backgroundResource} onChange={value => update({ backgroundResource: value })} />
        </Item>
      </Group>
    </div>
  );
};

export default PropertiesWindow;
