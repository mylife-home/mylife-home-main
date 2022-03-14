import React, { FunctionComponent } from 'react';
import SplitPane from '../lib/split-pane';
import SideBar from './sidebar';
import MainView from './main-view';

const UiDesigner: FunctionComponent = () => (
  <SplitPane split="vertical" defaultSize={300} minSize={300}>
    <SideBar />
    <MainView />
  </SplitPane>
);

export default UiDesigner;
