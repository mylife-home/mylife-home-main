import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../lib/icons';
import { ToolbarIconButton, ToolbarMenuIconButton } from '../../lib/toolbar';
import { useProjectValidation, useRefreshComponentsFromOnline, useRefreshComponentsFromCoreProject, useProjectDeploy } from './behaviors';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshComponentsFromCoreProject = useRefreshComponentsFromCoreProject();
  const refreshComponentsFromOnline = useRefreshComponentsFromOnline();
  const validateProject = useProjectValidation();
  const deployProject = useProjectDeploy();

  return (
    <Toolbar className={className}>

      <ToolbarMenuIconButton title="Rafraîchir les composants"icon={ComponentIcon}>
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
      </ToolbarMenuIconButton>

      <ToolbarIconButton title="Valider" icon={CheckIcon} onClick={validateProject} />
      <ToolbarIconButton title="Déployer" icon={PublishIcon} onClick={deployProject} />

    </Toolbar>
  );
}

export default Actions;
