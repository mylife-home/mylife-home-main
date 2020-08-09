import React, { FunctionComponent, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import TabPanel, { TabPanelItem } from './tab-panel';
import StartPage from './start-page';
import CoreDesigner from './core-designer';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
  }
}));

const Layout: FunctionComponent = () => {
  const startPageItem: TabPanelItem = {
    id: 'start-page',
    title: 'Démarrage',
    closable: false,
    render: () => <StartPage onNewCoreDesigner={addCoreDesignerTab} />
  }

  const classes = useStyles();
  const [tabs, setTabs] = useState([ startPageItem ]);
  const [tabIndex, setTabIndex] = useState(0);
  const idCounter = useRef(0);

  const getId = () => {
    return ++idCounter.current;
  }

  const closeTab = (index: number) => {
    setTabs(tabs => removeItem(tabs, index));

    if(tabIndex >= index) {
      const newIndex = tabIndex - 1;
      setTabIndex(newIndex === -1 ? 0 : newIndex);
    }
  };

  const addTab = (item: TabPanelItem) => setTabs(tabs => [...tabs, item]);

  const addCoreDesignerTab = () => {
    const id = getId();

    addTab({
      id: `core-designer-${id}`,
      title: `Core designer ${id}`,
      closable: true,
      render: () => <CoreDesigner />
    });
  };

  const handleMove = (sourceIndex: number, targetIndex: number) => {
    const newTabs = [...tabs];

    newTabs.splice(sourceIndex, 1);
    newTabs.splice(targetIndex, 0, tabs[sourceIndex]);

    setTabs(newTabs);

    if (tabIndex === sourceIndex) {
      setTabIndex(targetIndex);
    }
  };

  const handleSelect = setTabIndex;

  return (
    <TabPanel
      className={classes.root}
      items={tabs}
      selectedIndex={tabIndex}
      onClose={closeTab}
      onMove={handleMove}
      onSelect={handleSelect}
    />
  );
};

export default Layout;

function removeItem<T>(array: T[], index: number) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}
