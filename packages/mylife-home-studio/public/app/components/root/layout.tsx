import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import TabPanel, { useTabPanelId } from '../lib/tab-panel';
import StartPage from '../start-page';
import CoreDesigner from '../core-designer';

import { AppState } from '../../store/types';
import { TabType } from '../../store/tabs/types';
import { closeTab, activateTab, moveTab } from '../../store/tabs/actions';
import { getTabList, getTab, getSelectedTabId } from '../../store/tabs/selectors';

const Panel: FunctionComponent = () => {
  const tabId = useTabPanelId();
  const tab = useSelector((state: AppState) => getTab(state, tabId));

  switch(tab.type) {
    case TabType.START_PAGE:
      return (<StartPage />);
    case TabType.CORE_DESIGNER:
      return (<CoreDesigner />);
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
  }
}));

const Layout: FunctionComponent = () => {
  const { tabs, selectedId, closeTab, activateTab, moveTab } = useConnect();
  const classes = useStyles();

  return (
    <TabPanel
      className={classes.root}
      items={tabs}
      selectedId={selectedId}
      onClose={closeTab}
      onMove={moveTab}
      onSelect={activateTab}
      panelComponent={Panel}
    />
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
