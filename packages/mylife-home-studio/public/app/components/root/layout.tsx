import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import TabPanel from '../lib/tab-panel';
import Panel from './panel';
import StatusBar from './status-bar';

import { closeTab, activateTab, moveTab } from '../../store/tabs/actions';
import { getTabList, getSelectedTabId } from '../../store/tabs/selectors';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  tabPanel: {
    flex: 1,
  },
  statusBar: {

  }
}));

const Layout: FunctionComponent = () => {
  const { tabs, selectedId, closeTab, activateTab, moveTab } = useConnect();
  const classes = useStyles();

  return (
    <div className={classes.root}>

      <TabPanel
        className={classes.tabPanel}
        items={tabs}
        selectedId={selectedId}
        onClose={closeTab}
        onMove={moveTab}
        onSelect={activateTab}
        panelComponent={Panel}
      />

      <StatusBar className={classes.statusBar} />

    </div>
  );
};

export default Layout;

function useConnect() {
  const dispatch = useDispatch();
  return {
    tabs: useSelector(getTabList),
    selectedId: useSelector(getSelectedTabId),
    ...useMemo(() => ({
      closeTab: (id: string) => { dispatch(closeTab({ id })); },
      activateTab: (id: string) => { dispatch(activateTab({ id })); },
      moveTab: (id: string, position: number) => { dispatch(moveTab({ id, position })); },
    }), [dispatch])
  };
}
