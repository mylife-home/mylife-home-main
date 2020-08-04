import React, { FunctionComponent, useState, SyntheticEvent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import Close from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const initialList = ['one', 'two', 'three'];

const Layout: FunctionComponent = () => {
  const classes = useStyles();
  const [tabs, setTabs] = useState(initialList);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.ChangeEvent, newIndex: number) => {
    console.log('handleTabChange');

    setTabIndex(newIndex);
  };

  const closeTab = (index: number) => {
    setTabs(tabs => removeItem(tabs, index));

    if(tabIndex >= index) {
      setTabIndex(tabIndex - 1);
    }
  };

  return (
    <div className={classes.root}>

      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={
              <span>
                {tab}
                <IconButton onClick={(e) => {
                  console.log('onClick');
                  e.stopPropagation();
                  closeTab(index);
                }}>
                  <Close/>
                </IconButton>
              </span>
            } id={`scrollable-auto-tab-${index}`} aria-controls={`scrollable-auto-tabpanel-${index}`} />
          ))}
        </Tabs>
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