import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { parseType } from '../../../lib/member-types';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useSelectComponent, useToggleComponent } from '../../selection';
import { Konva, Rect, Group } from '../../drawing/konva';
import { Point } from '../../drawing/types';
import { useCanvasTheme } from '../../drawing/theme';
import { useViewPortVisibility } from '../../drawing/viewport-manips';
import { computeComponentRect, posToGrid } from '../../drawing/shapes';
import { useSafeSelector } from '../../drawing/use-safe-selector';
import Border from '../../drawing/border';
import { useMovableComponent, useComponentData } from '../../component-move';
import { isBindingTarget } from '../../binding-tools';
import { Title, Property, BorderGroup } from './layout';
import { BindingSource, DragEventType, useBindingDndInfo, useBindingDraggable } from '../binding-dnd';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponent, getPlugin, getInstance, isComponentSelected } from '../../../../store/core-designer/selectors';

export interface ComponentProps {
  componentId: string;
}

// Note: we split component layout and hit because the hit support the DnD which is not snapped to grid

const Component: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const tabId = useTabPanelId();
  const selected = useSelector(useCallback((state: AppState) => isComponentSelected(state, tabId, componentId), [tabId, componentId]));

  return selected ? (
    <SelectedComponent componentId={componentId} />
  ) : (
    <SelectableComponent componentId={componentId} />
  );
};

export default Component;

const SelectableComponent: FunctionComponent<ComponentProps> = ({ componentId }) => {
  return (
    <>
      <ComponentLayout componentId={componentId} />
      <ComponentHit componentId={componentId} />
    </>
  );
};

const SelectedComponent: FunctionComponent<ComponentProps> = ({ componentId }) => {
  const { position } = useComponentData(componentId);
  const { move, moveEnd } = useMovableComponent(componentId);

  const dragMoveHandler = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const userPos: Point = { x: e.target.x(), y : e.target.y() };
    move(posToGrid(userPos));
  }, [move]);

  return (
    <>
      <ComponentSelectionMark
        componentId={componentId}
        position={position}
      />

      <ComponentLayout
        componentId={componentId}
        position={position}
      />

      <ComponentHit
        componentId={componentId}
        position={position}
        onDragMove={dragMoveHandler}
        onDragEnd={moveEnd}
      />
    </>
  );
};

const ComponentSelectionMark: FunctionComponent<{componentId: string; position?: types.Position;}> = ({ componentId, position }) => {
  const theme = useCanvasTheme();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, component.plugin), [component.plugin]));

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, plugin);

  return (
    <Border
      {...rect}
      type='outer'
      color={theme.borderColorSelected}
      thickness={theme.selectionWidth}
    />
  );
};

interface ComponentLayoutProps {
  componentId: string;
  position?: types.Position;
}

const ComponentLayout: FunctionComponent<ComponentLayoutProps> = ({ componentId, position }) => {
  const theme = useCanvasTheme();
  const { isRectVisible } = useViewPortVisibility();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, component.plugin), [component.plugin]));
  const instance = useSafeSelector(useCallback((state: AppState) => getInstance(state, plugin.instance), [plugin.instance]));
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
    <>
      <Group {...rect} listening={false}>
        <Rect x={0} y={0} width={rect.width} height={rect.height} fill={component.external ? theme.backgroundColorExternal : theme.backgroundColor} />

        <Title text={component.id} />

        <BorderGroup yIndex={yIndex.peek()}>
          <Property yIndex={yIndex.next()} icon='instance' primary={instance.instanceName} primaryItalic />
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
    </>

  );
};

interface ComponentHitProps extends ComponentLayoutProps {
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const ComponentHit: FunctionComponent<ComponentHitProps> = ({ componentId, position, onDragMove, onDragEnd }) => {
  const theme = useCanvasTheme();
  const { isRectVisible } = useViewPortVisibility();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, component.plugin), [component.plugin]));
  const onDrag = useBindingDraggable();
  const selectComponent = useSelectComponent();
  const toggleComponent = useToggleComponent();
  const select = useCallback(() => selectComponent(componentId), [selectComponent, componentId]);
  const toggle = useCallback(() => toggleComponent(componentId), [toggleComponent, componentId]);

  const stateItems = useMemo(() => buildMembers(componentId, plugin, plugin.stateIds), [componentId, plugin]);
  const actionItems = useMemo(() => buildMembers(componentId, plugin, plugin.actionIds), [componentId, plugin]);
  const configItemsCount = useMemo(() => component.external ? 0 : plugin.configIds.length, [component.external, plugin]);

  const mouseDownHandler = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    if (metaPressed) {
      toggle();
    } else {
      select();
    }
  }, [toggle, select]);

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, plugin);

  if (!isRectVisible(rect)) {
    return null;
  }

  const yIndex = createIndexManager();
  yIndex.add(configItemsCount + 2); // 2 => instance + plugin

  return (
    <Group
      {...rect}
      onMouseDown={mouseDownHandler}
      draggable={!!onDragMove && !!onDragEnd}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <Rect x={0} y={0} width={rect.width} height={rect.height} />

      {stateItems.map((item, index) => (
        <PropertyHit
          key={index}
          onDrag={onDrag}
          bindingSource={item.bindingSource}
          yIndex={yIndex.next()}
        />
      ))}

      {actionItems.map((item, index) => (
        <PropertyHit
          key={index}
          onDrag={onDrag}
          bindingSource={item.bindingSource}
          yIndex={yIndex.next()}
        />
      ))}

    </Group>
  );
};

interface PropertyHitProps {
  yIndex: number;
  bindingSource: BindingSource;
  onDrag: (type: DragEventType, mousePosition: types.Position, source?: BindingSource) => void;
}

const PropertyHit: FunctionComponent<PropertyHitProps> = ({ yIndex, bindingSource, onDrag }) => {
  const theme = useCanvasTheme();
  const propertyOnDrag = useCallback((type: DragEventType, mousePosition: types.Position) => onDrag(type, mousePosition, bindingSource), [bindingSource, onDrag]);

  const yBase = theme.component.boxHeight * yIndex;

  const createDragEventHandler = (type: DragEventType) => {
    return (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      propertyOnDrag(type, { x: e.evt.x, y: e.evt.y });
    };
  };

  return (
    <Rect
      x={0}
      y={yBase}
      width={theme.component.width}
      height={theme.component.boxHeight}
      draggable
      onDragStart={createDragEventHandler('start')}
      onDragMove={createDragEventHandler('move')}
      onDragEnd={createDragEventHandler('end')}
    />
  );

}

function createIndexManager() {
  let index = 0; // start at 1 for Title

  return { 
    next: () => ++index, 
    peek: () =>  index + 1,
    add: (count: number) => index += count,
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
