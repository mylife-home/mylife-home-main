import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import SplitPane from '../split-pane';
import Canvas from './canvas';
import Component from './component';

const CoreDesigner: FunctionComponent = () => (
  <SplitPane split="vertical" defaultSize={200}>

    <Box>
      <Typography>Selection</Typography>
      <Typography>MiniMap</Typography>
      <Typography>Toolbox</Typography>
    </Box>

    <Canvas>
      <Component x={50} y={100} />
    </Canvas>

  </SplitPane>
);

export default CoreDesigner;