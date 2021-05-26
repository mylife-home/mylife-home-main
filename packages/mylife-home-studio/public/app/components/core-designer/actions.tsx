import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import PublishIcon from '@material-ui/icons/Publish';
import { ToolbarIconButton, IconWithBadge } from '../lib/toolbar';
import { InstanceIcon } from '../lib/icons';
import { FileIcon } from '../deploy/icons';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {

  return (
    <Toolbar className={className}>

      <ToolbarIconButton title="Déployer vers un fichier de configuration de déploiement" icon={<DeployToFileIcon />} onClick={() => console.log('TODO')} />
      <ToolbarIconButton title="Déployer sur une instance en ligne" icon={<DeployOnlineIcon />} onClick={() => console.log('TODO')} />

    </Toolbar>
  );
}

export default Actions;

const DeployToFileIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<FileIcon />}
  />
);

const DeployOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<InstanceIcon />}
  />
);
