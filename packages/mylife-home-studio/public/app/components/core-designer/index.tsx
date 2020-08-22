import React, { FunctionComponent, useState } from 'react';
import Konva from 'konva';
import { useStrictMode } from 'react-konva';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import SplitPane from '../split-pane';
import Canvas, { Rectangle } from './canvas';
import Component from './component';
import MiniView from './mini-view';

// TODO: improve konva imports
// https://github.com/konvajs/react-konva#minimal-bundle
useStrictMode(true);

const initialComponents = [{
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

const CoreDesigner: FunctionComponent = () => {
  const [gridSize, setGridSize] = useState(24);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [components, setComponents] = useState(initialComponents);

  const handleSliderChange = (event: React.ChangeEvent, newValue: number) => {
    setGridSize(newValue);
  };

  const handleMoveComponent = (id: string, pos: Konva.Vector2d) => {
    setComponents(components => components.map(comp => {
      if (comp.id !== id) {
        return comp;
      }

      return { ...comp, x: pos.x, y: pos.y };
    }));
  };

  return (
    <SplitPane split="vertical" defaultSize={300}>

      <Box p={3}>
        <Box display='flex' flexDirection='column'>

          <Typography gutterBottom>
            Grid size: {gridSize}
          </Typography>
          <Slider min={4} max={40} step={4} value={gridSize} onChange={handleSliderChange} />

          <Typography>Selection</Typography>

          <MiniView components={components} selectedIndex={selectedIndex} />

          <Typography>Toolbox</Typography>

        </Box>
      </Box>

      <Canvas onViewChange={(rect: Rectangle, zoom: number) => console.log('onViewChange', rect, zoom)}>
        {components.map((component, index) => (
          <Component key={index} {...component} selected={index === selectedIndex} onSelect={() => setSelectedIndex(index)} onMove={(pos: Konva.Vector2d) => handleMoveComponent(component.id, pos)} />  
        ))}
      </Canvas>

    </SplitPane>
  );
};

export default CoreDesigner;