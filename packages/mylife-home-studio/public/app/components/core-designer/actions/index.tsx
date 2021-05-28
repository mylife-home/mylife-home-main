import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import PublishIcon from '@material-ui/icons/Publish';
import RefreshIcon from '@material-ui/icons/Refresh';
import GetAppIcon from '@material-ui/icons/GetApp';

import { ToolbarIconButton, IconWithBadge } from '../../lib/toolbar';
import { InstanceIcon, ProjectIcon } from '../../lib/icons';
import { FileIcon } from '../../deploy/icons';
import { useImportFromProject, useRefreshToolboxFromOnline, useDeployToFiles, useDeployToOnline } from './behaviors';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const importFromProject = useImportFromProject();
  const refreshToolboxFromOnline = useRefreshToolboxFromOnline();
  const deployToFiles = useDeployToFiles();
  const deployToOnline = useDeployToOnline();

  return (
    <Toolbar className={className}>
      <ToolbarIconButton title="Importer depuis un autre projet" icon={<ImportFromProject />} onClick={importFromProject} />
      <ToolbarIconButton title="Rafraîchir la boîte à outils depuis les entités en ligne" icon={<RefreshFromOnlineIcon />} onClick={refreshToolboxFromOnline} />
      <ToolbarIconButton title="Déployer vers un fichier de configuration de déploiement" icon={<DeployToFilesIcon />} onClick={deployToFiles} />
      <ToolbarIconButton title="Déployer sur une instance en ligne" icon={<DeployToOnlineIcon />} onClick={deployToOnline} />
    </Toolbar>
  );
}

export default Actions;

const ImportFromProject: FunctionComponent = () => (
  <IconWithBadge
    main={<GetAppIcon />}
    badge={<ProjectIcon />}
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
