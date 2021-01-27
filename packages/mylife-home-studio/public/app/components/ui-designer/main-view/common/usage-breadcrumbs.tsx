import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import HomeIcon from '@material-ui/icons/Home';

import { UiElementPath, UiElementPathNode } from '../../../../store/ui-designer/types';
import { WindowIcon, ImageIcon, ActionIcon } from '../../../lib/icons';

const useStyles = makeStyles((theme) => ({
  node: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
    width: '1em',
    height: '1em',
  },
}));

const UsageBreadcrumbs: FunctionComponent<{ className?: string; item: UiElementPath }> = ({ className, item }) => {
  const classes = useStyles();
  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className={className}>
      {item.map((node, index) => (
        <Typography key={index} color="textPrimary" className={classes.node}>
          {renderIcon(node, classes.icon)}
          {node.id}
        </Typography>
      ))}
    </Breadcrumbs>
  );
};

export default UsageBreadcrumbs;

function renderIcon(node: UiElementPathNode, className: string) {
  switch (node.type) {
    case 'defaultWindow':
      return (
        <Tooltip title="Fenêtre par défaut">
          <HomeIcon className={className} />
        </Tooltip>
      );

    case 'window':
      return (
        <Tooltip title="Fenêtre">
          <WindowIcon className={className} />
        </Tooltip>
      );

    case 'control':
      return (
        <Tooltip title="Contrôle">
          <ImageIcon className={className} />
        </Tooltip>
      );

    case 'action':
      return (
        <Tooltip title="Action">
          <ActionIcon className={className} />
        </Tooltip>
      );

    default:
      throw new Error(`Unsupported node type: '${node.type}'`);
  }
}
