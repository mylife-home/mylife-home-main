import React, { FunctionComponent, useMemo } from 'react';

import { getWindowsIds, getWindow, makeGetWindowUsage } from '../../../../../store/ui-designer/selectors';
import { Group, Item } from '../../common/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ResourceSelector from '../../common/resource-selector';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { useWindowState } from '../window-state';
import { useSnapValue } from '../snap';

const PropertiesWindow: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { window, update } = useWindowState();
  const snap = useSnapValue();
  const usage = useWindowUsage(window.id);

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

      <Group title={"Utilisation"}>
        {usage.map(item => 
          (JSON.stringify(item)))}
      </Group>
    </div>
  );
};

export default PropertiesWindow;

function useWindowUsage(id: string) {
  const getWindowUsage = useMemo(() => makeGetWindowUsage(), []);
  return useTabSelector((state, tabId) => getWindowUsage(state, tabId, id));
}