import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSelectComponent } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getBinding, getSelectedBinding, makeGetComponentDefinitionProperties } from '../../../store/core-designer/selectors';
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
  const selectComponent = useSelectComponent();
  const { binding, sourceComponent, sourceDefinition, targetComponent, targetDefinition, clear } = useConnect();
  const centerBindingPosition = useCenterBinding(binding, sourceComponent, sourceDefinition, targetComponent, targetDefinition);

  const type = sourceDefinition.members[binding.sourceState].valueType;
  const handleSelectSource = () => selectComponent(binding.sourceComponent);
  const handleSelectTarget = () => selectComponent(binding.targetComponent);

  return (
    <div className={className}>
      <Group title="Binding">
        <div className={classes.actions}>
          <CenterButton position={centerBindingPosition} />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
        </div>

        <Item title="Source">
          <Link variant="body1" color="textPrimary" href="#" onClick={handleSelectSource}>{`${sourceComponent.componentId}.${binding.sourceState}`}</Link>
        </Item>
        <Item title="Cible">
          <Link variant="body1" color="textPrimary" href="#" onClick={handleSelectTarget}>{`${targetComponent.componentId}.${binding.targetAction}`}</Link>
        </Item>
        <Item title="Type">
          <Typography variant="body1" color="textPrimary">{type}</Typography>
        </Item>
      </Group>
    </div>
  );
};

export default Binding;

function useConnect() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const bindingId = useSelector(useCallback((state: AppState) => getSelectedBinding(state, tabId), [tabId]));

  const binding = useSelector(useCallback((state: AppState) => getBinding(state, bindingId), [bindingId]));
  const getSourceComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const getTargetComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const sourceComponent = useSelector(useCallback((state: AppState) => getComponent(state, binding.sourceComponent), [binding.sourceComponent]));
  const targetComponent = useSelector(useCallback((state: AppState) => getComponent(state, binding.targetComponent), [binding.targetComponent]));
  const sourceDefinition = useSelector(useCallback((state: AppState) => getSourceComponentDefinitionProperties(state, sourceComponent.definition), [sourceComponent.definition]));
  const targetDefinition = useSelector(useCallback((state: AppState) => getTargetComponentDefinitionProperties(state, targetComponent.definition), [targetComponent.definition]));

  const clear = useCallback(() => {
    dispatch(clearBinding({ bindingId }));
  }, [dispatch, bindingId]);

  return { binding, sourceComponent, sourceDefinition, targetComponent, targetDefinition, clear };
}

function useCenterBinding(binding: types.Binding, sourceComponent: types.Component, sourceDefinition: types.ComponentDefinitionProperties, targetComponent: types.Component, targetDefinition: types.ComponentDefinitionProperties) {
  const theme = useCanvasTheme();

  return useMemo(() => {
    const { sourceAnchor, targetAnchor } = computeBindingAnchors(theme, binding, sourceComponent, sourceDefinition, targetComponent, targetDefinition);
    return computeCenter(sourceAnchor, targetAnchor);
  }, [theme, binding, sourceComponent, targetComponent]);
}

function computeCenter(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}
