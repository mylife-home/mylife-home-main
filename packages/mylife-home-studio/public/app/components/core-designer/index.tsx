import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
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

const CoreDesigner: FunctionComponent = () => (
  <SplitPane split="vertical" defaultSize={200}>

    <Box>
      <Typography>Selection</Typography>
      <Typography>MiniMap</Typography>
      <Typography>Toolbox</Typography>
    </Box>

    <Canvas context={{ gridSize: 24 }}>
      <Component x={5} y={10} {...component1} />
      <Component x={5} y={20} selected {...component2} />
    </Canvas>

  </SplitPane>
);

export default CoreDesigner;