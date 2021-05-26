import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { ToolbarIconButton, IconWithBadge } from '../../lib/toolbar';
import { useProjectValidation, useRefreshComponentsFromOnline, useRefreshComponentsFromCoreProject, useProjectDeploy } from './behaviors';
import { ProjectIcon, InstanceIcon } from '../../lib/icons';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshComponentsFromCoreProject = useRefreshComponentsFromCoreProject();
  const refreshComponentsFromOnline = useRefreshComponentsFromOnline();
  const validateProject = useProjectValidation();
  const deployProject = useProjectDeploy();

  return (
    <Toolbar className={className}>
      <ToolbarIconButton title="Rafraîchir les composants depuis un project core" icon={<RefreshFromProjectIcon />} onClick={refreshComponentsFromCoreProject} />
      <ToolbarIconButton title="Rafraîchir les composants depuis les instances en ligne" icon={<RefreshFromOnlineIcon />} onClick={refreshComponentsFromOnline} />
      <ToolbarIconButton title="Valider" icon={<CheckIcon />} onClick={validateProject} />
      <ToolbarIconButton title="Déployer" icon={<PublishIcon />} onClick={deployProject} />

    </Toolbar>
  );
}

export default Actions;

const RefreshFromProjectIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<ProjectIcon />}
  />
);

const RefreshFromOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<InstanceIcon />}
  />
);
