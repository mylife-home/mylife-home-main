import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

interface TabPanelProps {
  value: any;
  index: any;
}

const TabPanel: FunctionComponent<TabPanelProps> = ({ children, value, index, ...other }) => {

  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};


const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    height: '100%',
    width: '100%',

    // backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const OnlineView: FunctionComponent = () => {
  const [value, setValue] = React.useState(0);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs value={value} onChange={handleChange} orientation='vertical' className={classes.tabs}>
        <Tab label='entités' />
        <Tab label='composants' />
        <Tab label='logs' />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Typography>Entities</Typography>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography>Components</Typography>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography>Logs</Typography>
      </TabPanel>
    </div>
  );
};

export default OnlineView;
