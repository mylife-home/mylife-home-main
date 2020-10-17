import React, { FunctionComponent } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const Actions: FunctionComponent<{ className?: string; onCollapse: () => void; onExpand: () => void }> = ({ className, onCollapse, onExpand }) => (
  <div className={className}>
    <Tooltip title="Replier tout">
      <IconButton onClick={onCollapse}>
        <RemoveIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title="Déplier le niveau suivant">
      <IconButton onClick={onExpand}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  </div>
);

export default Actions;