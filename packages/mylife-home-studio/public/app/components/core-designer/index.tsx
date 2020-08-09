import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import SplitPane from '../split-pane';

const CoreDesigner: FunctionComponent = () => (
  <SplitPane split="vertical" minSize={50}>
    <Box>
      <Typography>Toolbox</Typography>
    </Box>
    <Box>
      <Typography>Canvas</Typography>
    </Box>
  </SplitPane>
);

export default CoreDesigner;