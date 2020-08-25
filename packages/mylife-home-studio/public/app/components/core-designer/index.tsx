import React, { FunctionComponent, useState, useMemo } from 'react';
import Konva from 'konva';
import { useStrictMode } from 'react-konva';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { ViewInfoProvider } from './base/view-info';
import { CanvasThemeProvider } from './base/theme';
import SplitPane from '../split-pane';
import Canvas from './canvas';
import Component from './component';
import Binding from './binding';
import MiniView from './mini-view';
import ZoomSlider from './zoom-slider';

import * as schema from '../../files/schema';

// TODO: improve konva imports
// https://github.com/konvajs/react-konva#minimal-bundle
useStrictMode(true);

const initialComponents = schema.vpanelCore.components;
const initialBindings = schema.vpanelCore.bindings;
/*
[{
  id: 'component-1',
  title: 'Component 1',
  states: ['value'],
  actions: ['setValue'],
  x: 5,
  y: 10
}, {
  id: 'component-2',
  title: 'Component 2',
  states: ['volume', 'status'],
  actions: ['setVolume', 'play', 'pause', 'prev', 'next'],
  x: 5,
  y: 20
}];
*/

interface Selection {
  type: 'component' | 'binding';
  index: number;
}

const CoreDesigner: FunctionComponent = () => {
  const [selection, setSelection] = useState<Selection>(null);
  const [components, setComponents] = useState(initialComponents);
  const [bindings, setBindings] = useState(initialBindings);

  const compMap = useMemo(() => {
    const map: {[id: string]: schema.Component; } = {};
    for(const comp of components) {
      map[comp.id] = comp;
    }
    return map;
  }, [components]);

  const handleMoveComponent = (id: string, pos: Konva.Vector2d) => {
    setComponents(components => components.map(comp => {
      if (comp.id !== id) {
        return comp;
      }

      return { ...comp, x: pos.x, y: pos.y };
    }));
  };

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <SplitPane split="vertical" defaultSize={300}>

          <Box p={3}>
            <Box display='flex' flexDirection='column'>

              <ZoomSlider />

              <MiniView components={components} selectedIndex={selection?.type === 'component' ? selection.index : -1} />

              <Typography>Selection</Typography>
              <Typography>Toolbox</Typography>
            </Box>
          </Box>

          <Canvas>
            {bindings.map((binding, index) => {
              const sourceComponent = compMap[binding.sourceComponent];
              const targetComponent = compMap[binding.targetComponent];
              return (
                <Binding
                  key={index}
                  selected={selection?.type === 'binding' && selection.index === index}
                  onSelect={() => setSelection({ type: 'binding', index })}
                  sourceComponent={sourceComponent}
                  targetComponent={targetComponent}
                  sourceState={binding.sourceState}
                  targetAction={binding.targetAction}
                />
              );
            })}

            {components.map((component, index) => (
              <Component
                key={index}
                {...component}
                selected={selection?.type === 'component' && selection.index === index}
                onSelect={() => setSelection({ type: 'component', index })}
                onMove={(pos: Konva.Vector2d) => handleMoveComponent(component.id, pos)} />  
            ))}
          </Canvas>

        </SplitPane>
      </ViewInfoProvider>
    </CanvasThemeProvider>
  );
};

export default CoreDesigner;