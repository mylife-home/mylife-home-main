import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import Link from '@material-ui/core/Link';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect, mergeRects, computeCenter } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';

import { getAllComponentsAndPlugins } from '../../../store/core-designer/selectors';
import { clearComponent } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-multiple' });

const Multiple: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { selectedComponents, select } = useSelection();
  const ids = useMemo(() => Object.keys(selectedComponents).sort(), [selectedComponents]);
  const { clearAll } = useActionsConnect();
  const centerPosition = useCenterPosition();

  return (
    <div className={className}>
      <Group title="Sélection multiple">
        <div className={classes.actions}>
          <CenterButton position={centerPosition} />
          <DeleteButton icon tooltip="Supprimer tous les composants" confirmText="Êtes-vous sûr de vouloir supprimer tous les composants ?" onConfirmed={clearAll} />
        </div>

        <Item title="Composants" multiline>
          {ids.map(id => (
            <Link key={id} variant="body1" color="textPrimary" href="#" onClick={() => select({ type: 'component', id})}>{id}</Link>
          ))}
        </Item>
      </Group>
    </div>
  );
};

export default Multiple;

function useActionsConnect() {
  const tabId = useTabPanelId();
  const { selectedComponents } = useSelection();
  const dispatch = useDispatch();

  const clearAll = useCallback(() => {
    for (const componentId of Object.keys(selectedComponents)) {
      dispatch(clearComponent({ id: tabId, componentId }));
    }
  }, [tabId, dispatch, selectedComponents]);

  return { clearAll };
}

function useCenterPosition() {
  const { selectedComponents } = useSelection();
  const { components, plugins } = useTabSelector(getAllComponentsAndPlugins);
  const theme = useCanvasTheme();

  return useMemo(() => {
    const rects = Object.keys(selectedComponents).map(id => {
      const component = components[id];
      const plugin = plugins[component.plugin];
      return computeComponentRect(theme, component, plugin);
    });

    return computeCenter(mergeRects(rects));

  }, [theme, selectedComponents]);
}
