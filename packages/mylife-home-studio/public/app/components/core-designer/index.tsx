import React, { FunctionComponent, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Divider from '@material-ui/core/Divider';

import { Selection } from './types';
import { ViewInfoProvider } from './drawing/view-info';
import { CanvasThemeProvider } from './drawing/theme';
import SplitPane from '../lib/split-pane';
import ZoomSlider from './zoom-slider';
import MiniView from './mini-view';
import MainView from './main-view';
import SelectionPanel from './selection-panel';

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

const useStyles = makeStyles((theme) => ({
  tab: {
    minWidth: 0,
  },
  miniViewContainer: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  }
}));

const CoreDesigner: FunctionComponent = () => {
  const classes = useStyles();
  const [selection, setSelection] = useState<Selection>(null);
  const [components, setComponents] = useState(initialComponents);
  const [bindings, setBindings] = useState(initialBindings);
  const [sideBarTab, setSideBarTab] = useState('selection');

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <SplitPane split="vertical" defaultSize={300} minSize={300}>

          <Box display='flex' flexDirection='column'>

            <div className={classes.miniViewContainer}>
              <MiniView components={components} selection={selection} />
              <ZoomSlider />
            </div>

            <Divider />

            <Tabs value={sideBarTab} onChange={(e, value) => setSideBarTab(value)} textColor='primary' indicatorColor='primary' variant='fullWidth'>
              <Tab classes={{root: classes.tab }} label='Sélection' value='selection' />
              <Tab classes={{root: classes.tab }} label='Boîte à outils' value='toolbox' />
            </Tabs>

            <div role='tabpanel' hidden={sideBarTab !== 'selection'}>
              <SelectionPanel
                components={components}
                bindings={bindings}
                selection={selection}
                setSelection={setSelection}
              />
            </div>

            <div role='tabpanel' hidden={sideBarTab !== 'toolbox'}>
              <Typography>Toolbox</Typography>
            </div>

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