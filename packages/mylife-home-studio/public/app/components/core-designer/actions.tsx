import React, { FunctionComponent } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import PublishIcon from '@material-ui/icons/Publish';
import { ToolbarIconButton } from '../lib/toolbar';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {

  return (
    <Toolbar className={className}>

      <ToolbarIconButton title="Déployer" icon={<PublishIcon />} onClick={() => console.log('TODO')} />

    </Toolbar>
  );
}

export default Actions;
