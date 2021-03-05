import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteIcon from '@material-ui/icons/Delete';

import { useTabSelector } from '../../lib/use-tab-selector';
import { getInstance, getPlugin } from '../../../store/core-designer/selectors';

const useStyles = makeStyles((theme) => ({
  deleteIcon: {
    color: theme.palette.error.main,
  }
}));

export const InstanceMenuButton: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const instance = useTabSelector((state, tabId) => getInstance(state, tabId, id));
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
        {instance.hasHidden && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Montrer tous les plugins
            </Typography>
          </MenuItem>
        )}

        {instance.hasShown && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <VisibilityOffIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Cacher tous les plugins
            </Typography>
          </MenuItem>
        )}

        <MenuItem onClick={handleClose}>
         <ListItemIcon className={classes.deleteIcon}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Supprimer tous les plugins inutilisés
          </Typography>
        </MenuItem>

        <MenuItem disabled>xx plugins</MenuItem>
        <MenuItem disabled>xx composants</MenuItem>
        <MenuItem disabled>xx composants externes</MenuItem>
      </Menu>
    </>
  );
};

export const PluginMenuButton: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const plugin = useTabSelector((state, tabId) => getPlugin(state, tabId, id));
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
        {plugin.toolboxDisplay === 'show' && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <VisibilityOffIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              cacher
            </Typography>
          </MenuItem>
        )}

        {plugin.toolboxDisplay === 'hide' && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Montrer
            </Typography>
          </MenuItem>
        )}

        {plugin.use === 'unused' && (
          <MenuItem onClick={handleClose}>
            <ListItemIcon className={classes.deleteIcon}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Supprimer
            </Typography>
          </MenuItem>
        )}

        <MenuItem disabled>xx composants</MenuItem>
        <MenuItem disabled>xx composants externes</MenuItem>
      </Menu>
    </>
  );
};