import React, { FunctionComponent } from 'react';
import SplitPane from '../lib/split-pane';
import { SelectionProvider } from './selection';
import SideBar from './sidebar';
import Main from './main';

const Deploy: FunctionComponent = () => {
  return (
    <SelectionProvider>
      <SplitPane split="vertical" defaultSize={400} minSize={300}>
        <SideBar />
        <Main />
      </SplitPane>
    </SelectionProvider>
  );
};

export default Deploy;
