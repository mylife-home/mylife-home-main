import React, { FunctionComponent } from 'react';
import SplitPane from '../lib/split-pane';
import { SelectionProvider } from './selection';
import SideBar from './sidebar';
import MainView from './main-view';

const UiDesigner: FunctionComponent = () => (
  <SelectionProvider>
    <SplitPane split="vertical" defaultSize={300} minSize={300}>
      <SideBar />
      <MainView />
    </SplitPane>
  </SelectionProvider>
);

export default UiDesigner;

// TODO
// - state+debounce comme recipe au niveau d'une fenêtre
// - les ressources en live
// - l'update de composants sur le serveur
// - rename resource/window