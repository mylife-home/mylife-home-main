import React, { FunctionComponent } from 'react';

import SplitPane from '../lib/split-pane';
import ObjectList from './object-list';
import MainView from './main-view';

const UiDesigner: FunctionComponent = () => (
  <SplitPane split="vertical" defaultSize={300} minSize={300}>

    <ObjectList />

    <MainView />

  </SplitPane>
);

export default UiDesigner;

// TODO
// - state+debounce comme recipe au niveau d'une fenêtre
// - les ressources en live
// - l'update de composants sur le serveur
// - rename resource/window