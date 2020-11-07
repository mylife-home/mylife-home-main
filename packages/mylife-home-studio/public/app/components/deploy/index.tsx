import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import SplitPane from '../lib/split-pane';
import SideBar from './sidebar';
import { SelectionProvider } from './selection';

const Deploy: FunctionComponent = () => {
  return (
    <SelectionProvider>
      <SplitPane split="vertical" defaultSize={400} minSize={300}>
        <SideBar />
        <Box>Main</Box>
      </SplitPane>
    </SelectionProvider>
  );
};

export default Deploy;
