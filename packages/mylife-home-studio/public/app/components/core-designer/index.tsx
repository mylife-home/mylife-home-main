import React, { FunctionComponent, useState, useMemo } from 'react';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { Selection } from './types';
import { ViewInfoProvider } from './base/view-info';
import { CanvasThemeProvider } from './base/theme';
import SplitPane from '../split-pane';
import ZoomSlider from './zoom-slider';
import MiniView from './mini-view';
import MainView from './main-view';

import * as schema from '../../files/schema';

const initialComponents = schema.vpanelCore.components;
const initialBindings = schema.vpanelCore.bindings;
/*
[{
  id: 'component-1',
  title: 'Component 1',
  states: ['value'],
  actions: ['setValue'],
  x: 5,
  y: 10
}, {
  id: 'component-2',
  title: 'Component 2',
  states: ['volume', 'status'],
  actions: ['setVolume', 'play', 'pause', 'prev', 'next'],
  x: 5,
  y: 20
}];
*/

const CoreDesigner: FunctionComponent = () => {
  const [selection, setSelection] = useState<Selection>(null);
  const [components, setComponents] = useState(initialComponents);
  const [bindings, setBindings] = useState(initialBindings);

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <SplitPane split="vertical" defaultSize={300}>

          <Box p={3}>
            <Box display='flex' flexDirection='column'>

              <ZoomSlider />

              <MiniView components={components} selection={selection} />

              <Typography>Selection</Typography>
              <Typography>Toolbox</Typography>
            </Box>
          </Box>

          <MainView
            components={components}
            setComponents={setComponents}
            bindings={bindings}
            setBindings={setBindings}
            selection={selection}
            setSelection={setSelection}
          />

        </SplitPane>
      </ViewInfoProvider>
    </CanvasThemeProvider>
  );
};

export default CoreDesigner;