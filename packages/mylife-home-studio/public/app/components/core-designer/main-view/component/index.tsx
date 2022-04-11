import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { parseType } from '../../../lib/member-types';
import { useTabSelector } from '../../../lib/use-tab-selector';
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
import { getComponent, getPlugin, getInstance, isComponentSelected, makeGetComponentDefinitionProperties, getTemplate, getActiveTemplate } from '../../../../store/core-designer/selectors';
import { ComponentConfiguration, Template } from '../../../../store/core-designer/types';

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
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const definition = useSafeSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, definition);

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
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const { isRectVisible } = useViewPortVisibility();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const properties = useSafeSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));
  const template = useTabSelector(getActiveTemplate);
  const bindingDndInfo = useBindingDndInfo();

  const stateItems = useMemo(() => buildMembers(template, componentId, properties, properties.stateIds), [template, componentId, properties]);
  const actionItems = useMemo(() => buildMembers(template, componentId, properties, properties.actionIds), [template, componentId, properties]);
  const configItems = useMemo(() => component.external ? [] : buildConfig(template, componentId, properties, component.config), [template, component.external, component.config, properties]);

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, properties);

  if (!isRectVisible(rect)) {
    return null;
  }

  const yIndex = createIndexManager();
  yIndex.next(); // for title

  return (
    <>
      <Group {...rect} listening={false}>
        <Rect x={0} y={0} width={rect.width} height={rect.height} fill={component.external ? theme.backgroundColorExternal : theme.backgroundColor} />

        <Title text={component.componentId} />

        <DefinitionLayout yIndex={yIndex.add(2)} definition={component.definition} />

        <BorderGroup yIndex={yIndex.peek()}>
          {configItems.map((item, index) => (
            <Property
              key={index}
              yIndex={yIndex.next()}
              exported={item.exported}
              icon='config'
              primary={item.id}
              secondary={item.secondary}
              split='middle'
            />
          ))}
        </BorderGroup>

        <BorderGroup yIndex={yIndex.peek()}>
          {stateItems.map((item, index) => (
            <Property
              key={index}
              yIndex={yIndex.next()}
              highlight={bindingDndInfo && isBindingTarget(bindingDndInfo.source, item.bindingSource)}
              exported={item.exported}
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
              yIndex={yIndex.next()}
              highlight={bindingDndInfo && isBindingTarget(bindingDndInfo.source, item.bindingSource)}
              exported={item.exported}
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

const DefinitionLayout: FunctionComponent<{ definition: types.ComponentDefinition, yIndex: number; }> = ({ definition, yIndex }) => {
  switch (definition.type) {
    case 'plugin':
      return (
        <PluginLayout yIndex={yIndex} id={definition.id} />
      );

    case 'template':
      return (
        <TemplateLayout yIndex={yIndex} id={definition.id} />
      );
  }
};

const PluginLayout: FunctionComponent<{ id: string; yIndex: number; }> = ({ id, yIndex }) => {
  const plugin = useSafeSelector(useCallback((state: AppState) => getPlugin(state, id), [id]));
  const instance = useSafeSelector(useCallback((state: AppState) => getInstance(state, plugin.instance), [plugin.instance]));

  return (
    <BorderGroup yIndex={yIndex}>
      <Property yIndex={yIndex} icon='instance' primary={instance.instanceName} primaryItalic />
      <Property yIndex={yIndex + 1} icon='plugin' primary={`${plugin.module}.${plugin.name}`} primaryItalic />
    </BorderGroup>
  );
};

const TemplateLayout: FunctionComponent<{ id: string; yIndex: number; }> = ({ id, yIndex }) => {
  const template = useSafeSelector(useCallback((state: AppState) => getTemplate(state, id), [id]));

  return (
    <BorderGroup yIndex={yIndex}>
      <Property yIndex={yIndex} icon='template' primary={'<Templates>'} primaryItalic />
      <Property yIndex={yIndex + 1} icon='template' primary={template.templateId} primaryItalic />
    </BorderGroup>
  );
};

interface ComponentHitProps extends ComponentLayoutProps {
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const ComponentHit: FunctionComponent<ComponentHitProps> = ({ componentId, position, onDragMove, onDragEnd }) => {
  const theme = useCanvasTheme();
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const { isRectVisible } = useViewPortVisibility();
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const definition = useSafeSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));
  const template = useTabSelector(getActiveTemplate);
  const onDrag = useBindingDraggable();
  const selectComponent = useSelectComponent();
  const toggleComponent = useToggleComponent();
  const select = useCallback(() => selectComponent(componentId), [selectComponent, componentId]);
  const toggle = useCallback(() => toggleComponent(componentId), [toggleComponent, componentId]);

  const stateItems = useMemo(() => buildMembers(template, componentId, definition, definition.stateIds), [template, componentId, definition]);
  const actionItems = useMemo(() => buildMembers(template, componentId, definition, definition.actionIds), [template, componentId, definition]);
  const configItemsCount = useMemo(() => component.external ? 0 : definition.configIds.length, [component.external, definition]);

  const mouseDownHandler = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    if (metaPressed) {
      toggle();
    } else {
      select();
    }
  }, [toggle, select]);

  const movedComponent = { ...component, position: position || component.position };
  const rect = computeComponentRect(theme, movedComponent, definition);

  if (!isRectVisible(rect)) {
    return null;
  }

  const yIndex = createIndexManager();
  yIndex.add(configItemsCount + 3); // 3 => title + instance + plugin

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
      console.log(type, bindingSource)
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
  let index = 0;

  return { 
    next: () => index++,
    peek: () => index,
    add: (count: number) => {
      const actual = index;
      index += count;
      return actual;
    }
  };
}

function buildMembers(template: Template, componentId: string, properties: types.ComponentDefinitionProperties, ids: string[]) {
  return ids.map(id => {
    const exported = !!template && !!Object.values(template.exports.members).find(item => item.component === componentId && item.member === id);
    const member = properties.members[id];
    const bindingSource: BindingSource =  { componentId, memberName: id, memberType: member.memberType, valueType: member.valueType };
    return { id, exported, secondary: parseType(member.valueType).typeId, bindingSource };
  });
}

function buildConfig(template: Template, componentId: string, properties: types.ComponentDefinitionProperties, config: ComponentConfiguration) {
  return properties.configIds.map(id => {
    const exported = !!template && !!Object.values(template.exports.config).find(item => item.component === componentId && item.configName === id);
    const type = properties.config[id].valueType;
    const value = config[id];
    return { id, exported, secondary: renderConfigValue(type, value, exported) };
  });
}

function renderConfigValue(type: types.ConfigType, value: any, exported: boolean) {
  if (exported) {
    return '';
  } else if (value == null) {
    return '<missing>'
  } else {
    return value.toString();
  }
}
