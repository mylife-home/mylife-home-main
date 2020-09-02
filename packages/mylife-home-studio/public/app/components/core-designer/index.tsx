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

const enum SideBarTabValues {
  SELECTION = 'selection',
  TOOLBOX = 'toolbox'
}

const CoreDesigner: FunctionComponent = () => {
  const classes = useStyles();
  const [selection, setSelection] = useState<Selection>(null);
  const [sideBarTab, setSideBarTab] = useState('selection');

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <SplitPane split="vertical" defaultSize={300} minSize={300}>

          <Box display='flex' flexDirection='column'>

            <div className={classes.miniViewContainer}>
              <MiniView selection={selection} />
              <ZoomSlider />
            </div>

            <Divider />

            <Tabs value={sideBarTab} onChange={(e, value) => setSideBarTab(value)} textColor='primary' indicatorColor='primary' variant='fullWidth'>
              <Tab classes={{root: classes.tab }} label='Sélection' value={SideBarTabValues.SELECTION} />
              <Tab classes={{root: classes.tab }} label='Boîte à outils' value={SideBarTabValues.TOOLBOX} />
            </Tabs>

            <div role='tabpanel' hidden={sideBarTab !== SideBarTabValues.SELECTION}>
              <SelectionPanel selection={selection} setSelection={setSelection} />
            </div>

            <div role='tabpanel' hidden={sideBarTab !== SideBarTabValues.TOOLBOX}>
              <Typography>Toolbox</Typography>
            </div>

          </Box>

          <MainView selection={selection} setSelection={setSelection} />

        </SplitPane>
      </ViewInfoProvider>
    </CanvasThemeProvider>
  );
};

export default CoreDesigner;
