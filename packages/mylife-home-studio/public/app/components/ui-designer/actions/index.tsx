import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../lib/icons';
import { useProjectValidation, useRefreshComponentsFromOnline, useRefreshComponentsFromCoreProject, useProjectDeploy } from './behaviors';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshComponentsFromCoreProject = useRefreshComponentsFromCoreProject();
  const refreshComponentsFromOnline = useRefreshComponentsFromOnline();
  const validateProject = useProjectValidation();
  const deployProject = useProjectDeploy();

  return (
    <Toolbar className={className}>

      <ButtonMenu variant="contained" startIcon={<ComponentIcon />} text={'Rafraîchir les composants'}>
        <MenuItem onClick={refreshComponentsFromCoreProject}>
          <ListItemIcon>
            <ProjectIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Depuis un projet core
          </Typography>
        </MenuItem>
        <MenuItem onClick={refreshComponentsFromOnline}>
          <ListItemIcon>
            <InstanceIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            Depuis les instances en ligne
          </Typography>
        </MenuItem>
      </ButtonMenu>

      <Button onClick={validateProject} variant="contained" startIcon={<CheckIcon />}>
        Valider
      </Button>

      <Button onClick={deployProject} variant="contained" startIcon={<PublishIcon />}>
        Déployer
      </Button>

    </Toolbar>
  );
}

export default Actions;

const ButtonMenu: FunctionComponent<ButtonProps & { text: string }> = ({ text, children, ...props }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button {...props} onClick={handleClick}>
        {text}
      </Button>

      <Menu
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        onClick={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};
