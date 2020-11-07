import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import SplitPane from '../lib/split-pane';
import SideBar from './sidebar';

const Deploy: FunctionComponent = () => (
  <SplitPane split="vertical" defaultSize={400} minSize={300}>
    <SideBar />
    <Box>Main</Box>
  </SplitPane>
);

export default Deploy;
