import React, { FunctionComponent, useState } from 'react';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core';

import SplitPane from '../split-pane';
import Canvas from './canvas';
import Component from './component';

const component1 = {
  title: 'Component 1',
  states: ['value'],
  actions: ['setValue']
};

const component2 = {
  title: 'Component 2',
  states: ['volume', 'status'],
  actions: ['setVolume', 'play', 'pause', 'prev', 'next']
}

const CoreDesigner: FunctionComponent = () => {
  const [gridSize, setGridSize] = useState(24);

  const handleSliderChange = (event: React.ChangeEvent, newValue: number) => {
    setGridSize(newValue);
  };

  return (
    <SplitPane split="vertical" defaultSize={200}>

      <Box p={3}>
        <Typography gutterBottom>
          Grid size: {gridSize}
        </Typography>
        <Slider min={4} max={40} step={4} value={gridSize} onChange={handleSliderChange} />

        <Typography>Selection</Typography>
        <Typography>MiniMap</Typography>
        <Typography>Toolbox</Typography>
      </Box>

      <Canvas context={{ gridSize: gridSize }}>
        <Component x={5} y={10} {...component1} />
        <Component x={5} y={20} selected {...component2} />
      </Canvas>

    </SplitPane>
  );
};

export default CoreDesigner;