import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import PublishIcon from '@material-ui/icons/Publish';
import RefreshIcon from '@material-ui/icons/Refresh';

import { ToolbarIconButton, IconWithBadge } from '../../lib/toolbar';
import { InstanceIcon } from '../../lib/icons';
import { FileIcon } from '../../deploy/icons';
import { useRefreshToolboxFromFiles, useRefreshToolboxFromOnline, useDeployToFiles, useDeployToOnline } from './behaviors';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshToolboxFromFiles = useRefreshToolboxFromFiles();
  const refreshToolboxFromOnline = useRefreshToolboxFromOnline();
  const deployToFiles = useDeployToFiles();
  const deployToOnline = useDeployToOnline();

  return (
    <Toolbar className={className}>
      <ToolbarIconButton title="Rafraîchir la boîte à outils depuis les fichiers de deploiement" icon={<RefreshFromFilesIcon />} onClick={refreshToolboxFromFiles} />
      <ToolbarIconButton title="Rafraîchir la boîte à outils depuis les entités en ligne" icon={<RefreshFromOnlineIcon />} onClick={refreshToolboxFromOnline} />
      <ToolbarIconButton title="Déployer vers un fichier de configuration de déploiement" icon={<DeployToFilesIcon />} onClick={deployToFiles} />
      <ToolbarIconButton title="Déployer sur une instance en ligne" icon={<DeployToOnlineIcon />} onClick={deployToOnline} />
    </Toolbar>
  );
}

export default Actions;

const RefreshFromFilesIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<FileIcon />}
  />
);

const RefreshFromOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<InstanceIcon />}
  />
);

const DeployToFilesIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<FileIcon />}
  />
);

const DeployToOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<InstanceIcon />}
  />
);
