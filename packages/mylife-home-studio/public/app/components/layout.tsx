import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { StyledTabs, MoveableTab } from './tabs';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const initialList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const Layout: FunctionComponent = () => {
  const classes = useStyles();
  const [tabs, setTabs] = useState(initialList);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.ChangeEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

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
    <div className={classes.root}>

      <AppBar position="static" color="default">
        <StyledTabs value={tabIndex} onChange={handleTabChange}>
          {tabs.map((tab, index) => (<MoveableTab key={index} text={tab} index={index} onClose={closeTab} onMove={handleMove} onSelect={handleSelect} />))}
        </StyledTabs>
      </AppBar>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          hidden={tabIndex !== index}
          id={`scrollable-auto-tabpanel-${index}`}
          aria-labelledby={`scrollable-auto-tab-${index}`}
        >
        {tabIndex === index && (
          <Box p={3}>
            <Typography>{tab}</Typography>
          </Box>
        )}
      </div>
    ))}
    </div>
  );
};

export default Layout;

function removeItem<T>(array: T[], index: number) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}
