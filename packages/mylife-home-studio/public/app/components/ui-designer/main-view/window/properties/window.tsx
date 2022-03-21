import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { makeGetWindowUsage } from '../../../../../store/ui-designer/selectors';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { Group, Item } from '../../../../lib/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ResourceSelector from '../../common/resource-selector';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import ElementPathBreadcrumbs from '../../common/element-path-breadcrumbs';
import { useWindowState } from '../window-state';
import { useSnapValue } from '../snap';

const useStyles = makeStyles((theme) => ({
  breadcrumbs: {
    flex: 1,
    margin: theme.spacing(1),
  },
}));

const PropertiesWindow: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { window, update } = useWindowState();
  const snap = useSnapValue();
  const usage = useWindowUsage(window.id);

  return (
    <div className={className}>
      <Group title={'Fenêtre'}>
        <Item title={'Identifiant'}>
          <ReadonlyStringEditor value={window.windowId} />
        </Item>
        <Item title={'Largeur'}>
          <SnappedIntegerEditor snap={snap} value={window.width} onChange={(value) => update({ width: value })} />
        </Item>
        <Item title={'Longueur'}>
          <SnappedIntegerEditor snap={snap} value={window.height} onChange={(value) => update({ height: value })} />
        </Item>
        <Item title={'Arrière-plan'}>
          <ResourceSelector value={window.backgroundResource} onChange={(value) => update({ backgroundResource: value })} />
        </Item>
      </Group>

      <Group title={'Utilisation'}>
        {usage.map((item, index) => (
          <Item key={index}>
            <ElementPathBreadcrumbs className={classes.breadcrumbs} item={item} />
          </Item>
        ))}
      </Group>
    </div>
  );
};

export default PropertiesWindow;

function useWindowUsage(id: string) {
  const getWindowUsage = useMemo(() => makeGetWindowUsage(), []);
  return useTabSelector((state, tabId) => getWindowUsage(state, tabId, id));
}
