import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import SvgIcon from '@material-ui/core/SvgIcon';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import HomeIcon from '@material-ui/icons/Home';

import { getWindowsIds, getWindow, makeGetWindowUsage } from '../../../../../store/ui-designer/selectors';
import { WindowUsageNode } from '../../../../../store/ui-designer/types';
import { WindowIcon, ImageIcon, ActionIcon } from '../../../../lib/icons';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { Group, Item } from '../../common/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ResourceSelector from '../../common/resource-selector';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import { useWindowState } from '../window-state';
import { useSnapValue } from '../snap';

const useStyles = makeStyles((theme) => ({
  breadcrumbs: {
    flex: 1,
    margin: theme.spacing(1),
  },
  breadcrumbsItem: {
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbsItemIcon: {
    marginRight: theme.spacing(1),
    width: '1em',
    height: '1em',
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
          <ReadonlyStringEditor value={window.id} />
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
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className={classes.breadcrumbs}>
              {item.map((node, index) => (
                <Typography key={index} color="textPrimary" className={classes.breadcrumbsItem}>
                  {renderIcon(node, classes.breadcrumbsItemIcon)}
                  {node.id}
                </Typography>
              ))}
            </Breadcrumbs>
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

function renderIcon(node: WindowUsageNode, className: string) {
  switch (node.type) {
    case 'defaultWindow':
      return (
        <Tooltip title="Fenêtre par défaut">
          <HomeIcon className={className} />
        </Tooltip>
      );

    case 'window':
      return (
        <Tooltip title="Fenêtre">
          <WindowIcon className={className} />
        </Tooltip>
      );

    case 'control':
      return (
        <Tooltip title="Contrôle">
          <ImageIcon className={className} />
        </Tooltip>
      );

    case 'action':
      return (
        <Tooltip title="Action">
          <ActionIcon className={className} />
        </Tooltip>
      );

    default:
      throw new Error(`Unsupported node type: '${node.type}'`);
  }
}
