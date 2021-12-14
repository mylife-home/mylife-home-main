import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { parseType } from '../../../lib/member-types';
import { useComponentSelection } from '../../selection';
import { Konva, Rect, Group } from '../../drawing/konva';
import { GRID_STEP_SIZE } from '../../drawing/defs';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
// import CachedGroup from '../../drawing/cached-group';
import { computeComponentRect, lockComponentPosition } from '../../drawing/shapes';
import { useMovableComponent } from '../../component-move';
import { Title, Property, BorderGroup } from './layout';
import { BindingSource, DragEventType, useBindingDndInfo, useBindingDraggable } from '../binding-dnd';

import * as types from '../../../../store/core-designer/types';
import { isBindingTarget } from '../../binding-tools';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const theme = useCanvasTheme();
  const { component, plugin, move, moveEnd } = useMovableComponent(componentId);
  const rect = computeComponentRect(theme, component, plugin);
  const { select } = useComponentSelection(componentId);
  const onDrag = useBindingDraggable();
  const bindingDndInfo = useBindingDndInfo();

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const userPos: Point = { x: e.target.x(), y : e.target.y() };
    const pos = lockComponentPosition(rect, userPos);
    move({ x: pos.x / GRID_STEP_SIZE, y : pos.y / GRID_STEP_SIZE });
  }, [rect, move, GRID_STEP_SIZE]);

  const stateItems = useMemo(() => buildMembers(componentId, plugin, plugin.stateIds), [componentId, plugin]);
  const actionItems = useMemo(() => buildMembers(componentId, plugin, plugin.actionIds), [componentId, plugin]);
  const configItems = useMemo(() => component.external ? [] : buildConfig(component.config, plugin), [component.external, component.config, plugin]);

  const yIndex = createIndexManager();

  const createDraggablePropertyHandler = (bindingSource: BindingSource) => (type: DragEventType, mousePosition: types.Position) => onDrag(type, mousePosition, bindingSource);

  return (
    <Group
      {...rect}
      onMouseDown={select}
      draggable
      onDragMove={dragMoveHandler}
      onDragEnd={moveEnd}
    >
      {/* CachedGroup breaks property highlights */}
      <Group x={0} y={0} width={rect.width} height={rect.height}>
        <Rect x={0} y={0} width={rect.width} height={rect.height} fill={component.external ? theme.backgroundColorExternal : theme.backgroundColor} />

        <Title text={component.id} />

        <BorderGroup yIndex={yIndex.peek()}>
          <Property yIndex={yIndex.next()} icon='instance' primary={plugin.instanceName} primaryItalic />
          <Property yIndex={yIndex.next()} icon='plugin' primary={`${plugin.module}.${plugin.name}`} primaryItalic />
        </BorderGroup>

        <BorderGroup yIndex={yIndex.peek()}>
          {configItems.map((item, index) => (
            <Property key={index} yIndex={yIndex.next()} icon='config' primary={item.id} secondary={item.secondary} split='middle' />
          ))}
        </BorderGroup>

        <BorderGroup yIndex={yIndex.peek()}>
          {stateItems.map((item, index) => (
            <Property
              key={index}
              onDrag={createDraggablePropertyHandler(item.bindingSource)}
              highlight={bindingDndInfo && isBindingTarget(bindingDndInfo.source, item.bindingSource)}
              yIndex={yIndex.next()}
              icon='state'
              primary={item.id}
              secondary={item.secondary}
              split='right'
              secondaryItalic
            />
          ))}
        </BorderGroup>

        <BorderGroup yIndex={yIndex.peek()}>
          {actionItems.map((item, index) => (
            <Property
              key={index}
              onDrag={createDraggablePropertyHandler(item.bindingSource)}
              highlight={bindingDndInfo && isBindingTarget(bindingDndInfo.source, item.bindingSource)}
              yIndex={yIndex.next()}
              icon='action'
              primary={item.id}
              secondary={item.secondary}
              split='right'
              secondaryItalic
            />
          ))}
        </BorderGroup>

      </Group>
    </Group>
  );
};

export default Component;

function createIndexManager() {
  let index = 0; // start at 1 for Title

  return { 
    next: ()  => ++index, 
    peek: () =>  index + 1
  };
}

function buildMembers(componentId: string, plugin: types.Plugin, ids: string[]) {
  return ids.map(id => {
    const member = plugin.members[id];
    const bindingSource: BindingSource =  { componentId, memberName: id, memberType: member.memberType, valueType: member.valueType };
    return { id, secondary: parseType(member.valueType).typeId, bindingSource };
  });
}

function buildConfig(config: { [name: string]: any }, plugin: types.Plugin) {
  return plugin.configIds.map(id => {
    const type = plugin.config[id].valueType;
    const value = config[id];
    return { id, secondary: renderConfigValue(type, value) };
  });
}

function renderConfigValue(type: types.ConfigType, value: any) {
  return value == null ? '<missing>' : value.toString();
}
