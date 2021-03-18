import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../../lib/tab-panel';
import { parseType } from '../../../lib/member-types';
import { useComponentSelection } from '../../selection';
import { Konva, Rect, Group } from '../../drawing/konva';
import { GRID_STEP_SIZE, LAYER_SIZE } from '../../drawing/defs';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
import Border from '../../drawing/border';
import CachedGroup from '../../drawing/cached-group';
import { computeComponentRect } from '../../drawing/shapes';
import { useSafeSelector } from '../../drawing/use-safe-selector';
import Title from './title';
import PropertyList from './property-list';
import Property from './property';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponent, getPlugin } from '../../../../store/core-designer/selectors';
import { moveComponent } from '../../../../store/core-designer/actions';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin, moveComponent } = useConnect(componentId);
  const rect = computeComponentRect(theme, component, plugin);
  const { select } = useComponentSelection(componentId);

  const dragBoundHandler = useCallback((pos: Point) => ({
    x: lockBetween(snapToGrid(pos.x, GRID_STEP_SIZE), LAYER_SIZE - rect.width),
    y: lockBetween(snapToGrid(pos.y, GRID_STEP_SIZE), LAYER_SIZE - rect.height),
  }), [theme, rect.height, rect.width]);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => moveComponent({ x: e.target.x() / GRID_STEP_SIZE, y : e.target.y() / GRID_STEP_SIZE }), [moveComponent, GRID_STEP_SIZE]);

  const stateItems = useMemo(() => buildMembers(plugin, plugin.stateIds), [plugin]);
  const actionItems = useMemo(() => buildMembers(plugin, plugin.actionIds), [plugin]);
  const configItems = useMemo(() => component.external ? [] : buildConfig(component.config, plugin), [component.external, component.config, plugin]);

  return (
    <Group
      {...rect}
      onMouseDown={select}
      draggable
      dragBoundFunc={dragBoundHandler}
      onDragMove={dragMoveHandler}
    >
      <CachedGroup x={0} y={0} width={rect.width} height={rect.height}>
        <Rect x={0} y={0} width={rect.width} height={rect.height} fill={component.external ? theme.backgroundColorExternal : theme.backgroundColor} />

        <Title text={component.id} />

        <Property yIndex={1} icon='instance' primary={plugin.instanceName} />
        <Property yIndex={2} icon='plugin' primary={`${plugin.module}.${plugin.name}`} />
        <Border x={0} y={(theme.component.boxHeight * 1) - 1} width={theme.component.width} height={theme.component.boxHeight * 2 + 1} color={theme.borderColor} type='inner' />

        <PropertyList yIndex={3} icon='state' items={stateItems} />
        <PropertyList yIndex={3 + stateItems.length} icon='action' items={actionItems} />
        <PropertyList yIndex={3 + stateItems.length + actionItems.length} icon='config' items={configItems} />
      </CachedGroup>
    </Group>
  );
};

export default Component;

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const component = useSafeSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, component.plugin));

  return {
    component, 
    plugin, 

    moveComponent: useCallback(
      (position: types.Position) => dispatch(moveComponent({ id: tabId, componentId, position })),
      [dispatch, tabId, componentId]
    )
  };
}

function snapToGrid(value: number, gridStep: number) {
  return Math.round(value / gridStep) * gridStep;
}

function lockBetween(value: number, max: number) {
  if (value < 0) {
    return 0;
  }

  if (value > max) {
    return max;
  }
  
  return value;
}

function buildMembers(plugin: types.Plugin, ids: string[]) {
  return ids.map(id => ({ primary: id, secondary: parseType(plugin.members[id].valueType).typeId}));
}

function buildConfig(config: { [name: string]: any }, plugin: types.Plugin) {
  return plugin.configIds.map(id => {
    const type = plugin.config[id].valueType;
    const value = config[id];
    // TODO: improve layout
    return { primary: id, secondary: renderConfigValue(type, value) };
  });
}

// TODO: implement + move commons
function renderConfigValue(type: types.ConfigType, value: any) {
  return JSON.stringify(value);
}