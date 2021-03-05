import React, { FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteIcon from '@material-ui/icons/Delete';

import { ComponentIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getInstanceIds, getInstance, getPlugin } from '../../../store/core-designer/selectors';
import { Plugin, CoreToolboxDisplay } from '../../../store/core-designer/types';

// TODO: unused transparent
// TODO: external another color

const useStyles = makeStyles((theme) => ({
  list: {
    overflowY: 'auto',
  },
  dragSource: {
    color: theme.palette.success.main,
  },
  indent1: {
    paddingLeft: theme.spacing(8),
  },
  indent2: {
    paddingLeft: theme.spacing(16),
  },
  deleteIcon: {
    color: theme.palette.error.main,
  }
}));

const Toolbox: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const instances = useTabSelector(getInstanceIds);

  return (
    <List className={clsx(className, classes.list)}>
      {instances.map((id) => (
        <Instance key={id} id={id} display="show" />
      ))}

      <Hidden>
        {instances.map((id) => (
          <Instance key={id} id={id} display="hide" />
        ))}
      </Hidden>
    </List>
  );
};

export default Toolbox;

const Hidden: FunctionComponent = ({ children }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
      <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText primary="Cachés" />
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

const Instance: FunctionComponent<{ id: string; display: CoreToolboxDisplay }> = ({ id, display }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const instance = useTabSelector((state, tabId) => getInstance(state, tabId, id));

  switch (display) {
    case 'show':
      if (!instance.hasShown) {
        return null;
      }
      break;

    case 'hide':
      if (!instance.hasHidden) {
        return null;
      }
      break;
  }

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick} className={display === 'show' ? null : classes.indent1}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>

        <ListItemText primary={instance.id} />

        <ListItemSecondaryAction>
          <InstanceMenuButton id={instance.id} />
        </ListItemSecondaryAction>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {instance.plugins.map((pluginId) => (
            <Plugin key={pluginId} id={pluginId} display={display} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const Plugin: FunctionComponent<{ id: string; display: CoreToolboxDisplay }> = ({ id, display }) => {
  const classes = useStyles();
  const plugin = useTabSelector((state, tabId) => getPlugin(state, tabId, id));

  if (display !== plugin.toolboxDisplay) {
    return null;
  }

  return (
    <ListItem button className={display === 'show' ? classes.indent1 : classes.indent2}>
      <ListItemIcon className={classes.dragSource}>
        <ComponentIcon />
      </ListItemIcon>

      <ListItemText primary={pluginDisplay(plugin)} />

      <ListItemSecondaryAction>
        <PluginMenuButton id={plugin.id} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function pluginDisplay(plugin: Plugin) {
  return `${plugin.module}.${plugin.name}`;
}

const InstanceMenuButton: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton aria-haspopup="true" onClick={handleClick}>
        <MoreHorizIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
          Montrer tous les plugins
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <VisibilityOffIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Cacher tous les plugins
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleClose}>
         <ListItemIcon className={classes.deleteIcon}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Supprimer tous les plugins (que si inutilisés)
          </Typography>
        </MenuItem>

        <MenuItem disabled>xx plugins</MenuItem>
        <MenuItem disabled>xx composants</MenuItem>
        <MenuItem disabled>xx composants externes</MenuItem>
      </Menu>
    </>
  );
};

const PluginMenuButton: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton aria-haspopup="true" onClick={handleClick}>
        <MoreHorizIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Montrer/cacher
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon className={classes.deleteIcon}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Supprimer (que si inutilisé)
          </Typography>
        </MenuItem>

        <MenuItem disabled>xx composants</MenuItem>
        <MenuItem disabled>xx composants externes</MenuItem>
      </Menu>
    </>
  );
};