import React, { FunctionComponent } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import Toolbar from '@material-ui/core/Toolbar';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { ToolbarIconButton } from '../../lib/toolbar';
import { useProjectValidation, useRefreshComponentsFromOnline, useRefreshComponentsFromCoreProject, useProjectDeploy } from './behaviors';
import { ProjectIcon, InstanceIcon } from '../../lib/icons';


const useStyles = makeStyles((theme) => ({
  badgeIcon: {
    background: null,
    color: darken(theme.palette.background.paper, 0.2),
  },
}));

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshComponentsFromCoreProject = useRefreshComponentsFromCoreProject();
  const refreshComponentsFromOnline = useRefreshComponentsFromOnline();
  const validateProject = useProjectValidation();
  const deployProject = useProjectDeploy();

  return (
    <Toolbar className={className}>
      <ToolbarIconButton title="Rafraîchir les composants depuis un project core" icon={RefreshFromProjectIcon} onClick={refreshComponentsFromCoreProject} />
      <ToolbarIconButton title="Rafraîchir les composants depuis les instances en ligne" icon={RefreshFromOnline} onClick={refreshComponentsFromOnline} />
      <ToolbarIconButton title="Valider" icon={CheckIcon} onClick={validateProject} />
      <ToolbarIconButton title="Déployer" icon={PublishIcon} onClick={deployProject} />

    </Toolbar>
  );
}

export default Actions;

const RefreshFromProjectIcon: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Badge badgeContent={<ProjectIcon />} classes={{badge: classes.badgeIcon}}>
      <RefreshIcon />
    </Badge>
  );
};

const RefreshFromOnline: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Badge badgeContent={<InstanceIcon />} classes={{badge: classes.badgeIcon}}>
      <RefreshIcon />
    </Badge>
  );
};