import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Link from '@material-ui/core/Link';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getPlugin, getBinding } from '../../../store/core-designer/selectors';
import { clearBinding } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-binding' });

const Binding: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { selection, select } = useSelection();
  const { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin, clear } = useConnect(selection.id);
  const componentBindingPosition = useCenterBinding(binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);

  const handleSelectSource = () => select({ type: 'component', id: binding.sourceComponent });
  const handleSelectTarget = () => select({ type: 'component', id: binding.targetComponent });

  return (
    <div className={className}>
      <Group title="Binding">
        <div className={classes.actions}>
          <CenterButton position={componentBindingPosition} />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
        </div>

        <Item title="Source">
          <Link variant="body1" color="textPrimary" href="#" onClick={handleSelectSource}>{`${binding.sourceComponent}.${binding.sourceState}`}</Link>
        </Item>
        <Item title="Cible">
          <Link variant="body1" color="textPrimary" href="#" onClick={handleSelectTarget}>{`${binding.targetComponent}.${binding.targetAction}`}</Link>
        </Item>
      </Group>
    </div>
  );
};

export default Binding;

function useConnect(bindingId: string) {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const binding = useSelector((state: AppState) => getBinding(state, tabId, bindingId));
  const sourceComponent = useSelector((state: AppState) => getComponent(state, tabId, binding.sourceComponent));
  const targetComponent = useSelector((state: AppState) => getComponent(state, tabId, binding.targetComponent));
  const sourcePlugin = useSelector((state: AppState) => getPlugin(state, tabId, sourceComponent.plugin));
  const targetPlugin = useSelector((state: AppState) => getPlugin(state, tabId, targetComponent.plugin));

  const clear = useCallback(() => {
    dispatch(clearBinding({ id: tabId, bindingId }));
  }, [tabId, dispatch, bindingId]);

  return { binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin, clear };
}

function useCenterBinding(binding: types.Binding, sourceComponent: types.Component, sourcePlugin: types.Plugin, targetComponent: types.Component, targetPlugin: types.Plugin) {
  const theme = useCanvasTheme();

  return useMemo(() => {
    const { sourceAnchor, targetAnchor } = computeBindingAnchors(theme, binding, sourceComponent, sourcePlugin, targetComponent, targetPlugin);
    return computeCenter(sourceAnchor, targetAnchor);
  }, [theme, binding, sourceComponent, targetComponent]);
}

function computeCenter(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}
