import React, { FunctionComponent, useState, SyntheticEvent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import MenuRoot from './menu-root';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const Layout: FunctionComponent = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <div className={classes.root}>

      <AppBar position='static'>
        <Toolbar>
          <MenuRoot color="inherit" menuId="simple-menu" title="Fichier" items={[
            { title: 'Nouveau', handler: () => console.log('new') },
            { title: 'Ouvrir', handler: () => console.log('open') },
          ]} />
        </Toolbar>

        <Paper square>
          <Tabs value={tab} onChange={handleTabChange} aria-label="simple tabs example" indicatorColor="primary" textColor="primary" variant="scrollable">
            <Tab label="Item One" {...a11yProps(0)} />
            <Tab label="Item Two" {...a11yProps(1)} />
            <Tab label="Item Three" {...a11yProps(2)} />
          </Tabs>
        </Paper>
      </AppBar>

      <TabPanel value={tab} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={tab} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={tab} index={2}>
        Item Three
      </TabPanel>
    </div>
  );
};

export default Layout;

interface TabPanelProps {
  readonly value: number;
  readonly index: number;
}

const TabPanel: FunctionComponent<TabPanelProps> = (props) =>  {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}