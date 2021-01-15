import React, { FunctionComponent } from 'react';

import { Group, Item } from '../../common/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ResourceSelector from '../../common/resource-selector';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import { useWindowState } from '../window-state';
import { useSnapValue } from '../snap';

const PropertiesWindow: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { window, update } = useWindowState();
  const snap = useSnapValue();

  return (
    <div className={className}>
      <Group title={"Fenêtre"}>
        <Item title={"Identifiant"}>
          <ReadonlyStringEditor value={window.id} />
        </Item>
        <Item title={"Largeur"}>
          <SnappedIntegerEditor snap={snap} value={window.width} onChange={value => update({ width: value })} />
        </Item>
        <Item title={"Longueur"}>
          <SnappedIntegerEditor snap={snap} value={window.height} onChange={value => update({ height: value })} />
        </Item>
        <Item title={"Arrière-plan"}>
          <ResourceSelector value={window.backgroundResource} onChange={value => update({ backgroundResource: value })} />
        </Item>
      </Group>
    </div>
  );
};

export default PropertiesWindow;
