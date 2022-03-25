import React, { FunctionComponent, useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Divider from '@material-ui/core/Divider';

import { ComponentMoveProvider } from './component-move';
import { ViewInfoProvider } from './drawing/view-info';
import { CanvasThemeProvider } from './drawing/theme';
import SplitPane from '../lib/split-pane';
import { useTabSelector } from '../lib/use-tab-selector';
import TemplateSelector from './template-selector';
import ZoomSlider from './zoom-slider';
import MiniView from './mini-view';
import MainView from './main-view';
import SelectionPanel from './selection-panel';
import Toolbox from './toolbox';
import TemplateExports from './template-exports';
import Actions from './actions';
import { getActiveTemplateId } from '../../store/core-designer/selectors';

const useStyles = makeStyles((theme) => ({
  sideBar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  templateSelector: {
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
  TOOLBOX = 'toolbox',
  EXPORTS = 'exports',
};

const CoreDesigner: FunctionComponent = () => {
  const classes = useStyles();
  const [sideBarTab, setSideBarTab] = useState(SideBarTabValues.SELECTION);
  const activeViewId = useTabSelector(getActiveTemplateId);
  const showExports = !!activeViewId;

  // On view change reset selected tab
  useEffect(() => {
    setSideBarTab(SideBarTabValues.SELECTION);
  }, [activeViewId]);

  return (
    <CanvasThemeProvider>
      <ViewInfoProvider>
        <ComponentMoveProvider>
          <SplitPane split="vertical" defaultSize={450} minSize={300}>

            <div className={classes.sideBar}>

              <TemplateSelector className={classes.templateSelector} />

              <Divider />

              <div className={classes.miniViewContainer}>
                <MiniView />
                <ZoomSlider />
              </div>

              <Divider />

              <Tabs value={sideBarTab} onChange={(e, value) => setSideBarTab(value)} textColor='primary' indicatorColor='primary' variant='fullWidth'>
                <Tab classes={{root: classes.tab }} label='Sélection' value={SideBarTabValues.SELECTION} />
                <Tab classes={{root: classes.tab }} label='Boîte à outils' value={SideBarTabValues.TOOLBOX} />
                {showExports && (
                  <Tab classes={{root: classes.tab }} label='Exports' value={SideBarTabValues.EXPORTS} />
                )}
              </Tabs>

              <div className={classes.tabPanel} role='tabpanel' hidden={sideBarTab !== SideBarTabValues.SELECTION}>
                <SelectionPanel className={classes.tabContent} />
              </div>

              <div className={classes.tabPanel} role='tabpanel' hidden={sideBarTab !== SideBarTabValues.TOOLBOX}>
                <Toolbox className={classes.tabContent} />
              </div>
              
              {showExports && (
                <div className={classes.tabPanel} role='tabpanel' hidden={sideBarTab !== SideBarTabValues.EXPORTS}>
                  <TemplateExports className={classes.tabContent} />
                </div>
              )}

              <Divider />

              <Actions />

            </div>

            <MainView />

          </SplitPane>
        </ComponentMoveProvider>
      </ViewInfoProvider>
    </CanvasThemeProvider>
  );
};

export default CoreDesigner;
