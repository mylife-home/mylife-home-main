import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import SplitPane from '../lib/split-pane';
import TreeView from './treeview';

const OnlineComponentsView: FunctionComponent = () => {
  return (
    <SplitPane split="vertical" defaultSize="50%" minSize={300}>

      <TreeView onNodeClick={console.log} />

      <Box p={3}>
        Detail
      </Box>
    </SplitPane>
  );
};

export default OnlineComponentsView;
