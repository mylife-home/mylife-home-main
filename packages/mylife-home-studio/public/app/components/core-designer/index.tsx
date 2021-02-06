import React, { FunctionComponent, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Divider from '@material-ui/core/Divider';

import { SelectionProvider } from './selection';
import { ViewInfoProvider } from './drawing/view-info';
import { CanvasThemeProvider } from './drawing/theme';
import SplitPane from '../lib/split-pane';
import ZoomSlider from './zoom-slider';
import MiniView from './mini-view';
import MainView from './main-view';
import SelectionPanel from './selection-panel';
import Toolbox from './toolbox';

const useStyles = makeStyles((theme) => ({
  sideBar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  miniViewContainer: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  tab: {
    minWidth: 0,
  },
  tabPanel: {
    position: 'relative',
    height: '100%',
  },
  tabContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }
}));

const enum SideBarTabValues {
  SELECTION = 'selection',
  TOOLBOX = 'toolbox'
};

const CoreDesigner: FunctionComponent = () => {
  const classes = useStyles();
  const [sideBarTab, setSideBarTab] = useState('selection');

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <SelectionProvider>
          <SplitPane split="vertical" defaultSize={300} minSize={300}>

            <div className={classes.sideBar}>

              <div className={classes.miniViewContainer}>
                <MiniView />
                <ZoomSlider />
              </div>

              <Divider />

              <Tabs value={sideBarTab} onChange={(e, value) => setSideBarTab(value)} textColor='primary' indicatorColor='primary' variant='fullWidth'>
                <Tab classes={{root: classes.tab }} label='Sélection' value={SideBarTabValues.SELECTION} />
                <Tab classes={{root: classes.tab }} label='Boîte à outils' value={SideBarTabValues.TOOLBOX} />
              </Tabs>

              <div className={classes.tabPanel} role='tabpanel' hidden={sideBarTab !== SideBarTabValues.SELECTION}>
                <SelectionPanel className={classes.tabContent} />
              </div>

              <div className={classes.tabPanel} role='tabpanel' hidden={sideBarTab !== SideBarTabValues.TOOLBOX}>
                <Toolbox className={classes.tabContent} />
              </div>

            </div>

            <MainView />

          </SplitPane>
        </SelectionProvider>
      </ViewInfoProvider>
    </CanvasThemeProvider>
  );
};

export default CoreDesigner;
