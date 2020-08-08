import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import TabPanel, { TabPanelItem } from './tab-panel';
import StartPage from './start-page';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
  }
}));

const items: TabPanelItem[] = [
  { id: 'start-page', title: 'Start Page', closable: false, render: () => <StartPage /> },
  createItem(1),
  createItem(2),
  createItem(3),
  createItem(4),
  createItem(5),
];

function createItem(index: number) {
  return { id: `item-${index}`, title: `Page ${index}`, closable: true, render: () => (
    <Box p={3}>
      <Typography>{`Page ${index}`}</Typography>
    </Box>
  ) };
}

const Layout: FunctionComponent = () => {
  const classes = useStyles();
  const [tabs, setTabs] = useState(items);
  const [tabIndex, setTabIndex] = useState(0);

  const closeTab = (index: number) => {
    setTabs(tabs => removeItem(tabs, index));

    if(tabIndex >= index) {
      const newIndex = tabIndex - 1;
      setTabIndex(newIndex === -1 ? 0 : newIndex);
    }
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
