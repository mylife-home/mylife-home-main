import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { parseType } from '../../../lib/member-types';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useComponentSelection } from '../../selection';
import { Konva, Rect, Group } from '../../drawing/konva';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
import { useViewPortVisibility } from '../../drawing/viewport-manips';
// import CachedGroup from '../../drawing/cached-group';
import { computeComponentRect, posToGrid } from '../../drawing/shapes';
import { useSafeSelector } from '../../drawing/use-safe-selector';
import { useMovableComponent } from '../../component-move';
import { isBindingTarget } from '../../binding-tools';
import { Title, Property, BorderGroup, PropertyProps } from './layout';
import { BindingSource, DragEventType, useBindingDndInfo, useBindingDraggable } from '../binding-dnd';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponent, getPlugin } from '../../../../store/core-designer/selectors';

export interface ComponentProps {
  componentId: string;
}

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const { component, plugin, move, moveEnd } = useMovableComponent(componentId);
  const { select, multiSelectToggle } = useComponentSelection(componentId);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const userPos: Point = { x: e.target.x(), y : e.target.y() };
    move(posToGrid(userPos));
  }, [move]);

  const mouseDownHandler = useCallback((e: Konva.KonvaEventObject<MouseEvent>)=> {
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    if (metaPressed) {
      multiSelectToggle();
    } else {
      select();
    }
  }, [multiSelectToggle, select]);

  return (
    <ComponentLayout
      componentId={componentId}
      position={component.position}
      onMouseDown={mouseDownHandler}
      onDragMove={dragMoveHandler}
      onDragEnd={moveEnd}
    />
  );
};

interface ComponentLayoutProps {
  componentId: string;
  position?: types.Position;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const ComponentLayout: FunctionComponent<ComponentLayoutProps> = ({ componentId, position, onMouseDown, onDragMove, onDragEnd }) => {
  const theme = useCanvasTheme();
  const { isRectVisible } = useViewPortVisibility();
  const tabId = useTabPanelId();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, tabId, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, tabId, component.plugin), [component.plugin]));
  const onDrag = useBindingDraggable();
  const bindingDndInfo = useBindingDndInfo();

  const stateItems = useMemo(() => buildMembers(componentId, plugin, plugin.stateIds), [componentId, plugin]);
  const actionItems = useMemo(() => buildMembers(componentId, plugin, plugin.actionIds), [componentId, plugin]);
  const configItems = useMemo(() => component.external ? [] : buildConfig(component.config, plugin), [component.external, component.config, plugin]);

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, plugin);

  if (!isRectVisible(rect)) {
    return null;
  }

  const yIndex = createIndexManager();

  return (
    <Group
      {...rect}
      onMouseDown={onMouseDown}
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
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
            <BindableProperty
              key={index}
              onDrag={onDrag}
              bindingSource={item.bindingSource}
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
            <BindableProperty
              key={index}
              onDrag={onDrag}
              bindingSource={item.bindingSource}
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

interface BindablePropertyProps extends Omit<PropertyProps, 'onDrag'> {
  bindingSource: BindingSource;
  onDrag: (type: DragEventType, mousePosition: types.Position, source?: BindingSource) => void;
}

const BindableProperty: FunctionComponent<BindablePropertyProps> = ({ bindingSource, onDrag, ...propertyProps }) => {
  const propertyOnDrag = useCallback((type: DragEventType, mousePosition: types.Position) => onDrag(type, mousePosition, bindingSource), [bindingSource, onDrag]);

  return <Property {...propertyProps} onDrag={propertyOnDrag} />;
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
