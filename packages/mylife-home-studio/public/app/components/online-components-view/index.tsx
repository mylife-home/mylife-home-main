import React, { FunctionComponent } from 'react';

import SplitPane from '../lib/split-pane';
import { Selection } from './common';
import TreeView from './treeview';
import Detail from './detail';

const OnlineComponentsView: FunctionComponent = () => {
  const [selection, setSelection] = React.useState<Selection>(null);

  return (
    <SplitPane split="vertical" defaultSize="50%" minSize={300}>
      <TreeView selection={selection} onSelect={setSelection} />
      <Detail selection={selection} />
    </SplitPane>
  );
};

export default OnlineComponentsView;
