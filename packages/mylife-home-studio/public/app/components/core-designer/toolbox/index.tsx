import React, { FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { InstanceIcon, PluginIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getInstanceIds, getInstance, getPlugin } from '../../../store/core-designer/selectors';
import { Plugin } from '../../../store/core-designer/types';

const useStyles = makeStyles((theme) => ({
  list: {
    overflowY: 'auto',
  },
  plugin: {
    paddingLeft: theme.spacing(8),
  },
}));

const Toolbox: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const instances = useTabSelector(getInstanceIds);

  return (
    <List className={clsx(className, classes.list)}>
      {instances.map((id) => (
        <Instance key={id} id={id} />
      ))}
    </List>
  );
};

export default Toolbox;

const Instance: FunctionComponent<{ id: string; }> = ({ id }) => {
  const [open, setOpen] = useState(true);
  const instance = useTabSelector((state, tabId) => getInstance(state, tabId, id));

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <InstanceIcon />
        </ListItemIcon>
        <ListItemText primary={id} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {instance.plugins.map(pluginId => (
            <Plugin key={pluginId} id={pluginId} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const Plugin: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const plugin = useTabSelector((state, tabId) => getPlugin(state, tabId, id));

  return (
    <ListItem button className={classes.plugin}>
      <ListItemIcon>
        <PluginIcon />
      </ListItemIcon>
      <ListItemText primary={pluginDisplay(plugin)} />
    </ListItem>
  );
};

function pluginDisplay(plugin: Plugin) {
  return `${plugin.module}.${plugin.name}`;
}