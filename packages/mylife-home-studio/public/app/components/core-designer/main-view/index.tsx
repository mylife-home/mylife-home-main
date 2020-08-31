import React, { FunctionComponent, useMemo } from 'react';

import { Layer } from '../drawing/konva';
import { Point } from '../drawing/types';
import { Selection } from '../types';
import Canvas from './canvas';
import Component from './component';
import Binding from './binding';
import ComponentSelectionMark from './component-selection-mark';

import * as schema from '../../../files/schema';

export interface MainViewProps {
  components: schema.Component[];
  setComponents: (callback: (components: schema.Component[]) => schema.Component[]) => void;
  bindings: schema.Binding[];
  setBindings: (callback: (bindings: schema.Binding[]) => schema.Binding[]) => void;
  selection: Selection;
  setSelection: (selection: Selection) => void;
}

const MainView: FunctionComponent<MainViewProps> = ({ components, setComponents, bindings, setBindings, selection, setSelection }) => {

  const compMap = useMemo(() => {
    const map: {[id: string]: schema.Component; } = {};
    for(const comp of components) {
      map[comp.id] = comp;
    }
    return map;
  }, [components]);

  const handleMoveComponent = (id: string, pos: Point) => {
    setComponents(components => components.map(comp => {
      if (comp.id !== id) {
        return comp;
      }

      return { ...comp, x: pos.x, y: pos.y };
    }));
  };

  const selectedComponent = selection && selection.type === 'component' && compMap[selection.id];

  return (
    <Canvas>
      <Layer name='bindings'>
        {bindings.map((binding, index) => {
          const sourceComponent = compMap[binding.sourceComponent];
          const targetComponent = compMap[binding.targetComponent];
          return (
            <Binding
              key={index}
              selected={selection?.type === 'binding' && selection.id === binding.id}
              onSelect={() => setSelection({ type: 'binding', id: binding.id })}
              sourceComponent={sourceComponent}
              targetComponent={targetComponent}
              sourceState={binding.sourceState}
              targetAction={binding.targetAction}
            />
          );
        })}
      </Layer>

      <Layer name='components'>
        {components.map((component, index) => (
          <Component
            key={index}
            {...component}
            onSelect={() => setSelection({ type: 'component', id: component.id })}
            onMove={(pos: Point) => handleMoveComponent(component.id, pos)} />  
        ))}

        {selectedComponent && <ComponentSelectionMark {...selectedComponent} />}
      </Layer>
    </Canvas>
  );
};

export default MainView;