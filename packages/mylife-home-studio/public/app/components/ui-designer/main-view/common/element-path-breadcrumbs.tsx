import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import HomeIcon from '@material-ui/icons/Home';

import { UiElementPath, UiElementPathNode } from '../../../../store/ui-designer/types';
import { WindowIcon, ImageIcon, TextIcon, ActionIcon } from '../../../lib/icons';

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

const ElementPathBreadcrumbs: FunctionComponent<{ className?: string; item: UiElementPath }> = ({ className, item }) => {
  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className={className}>
      {item.map((node, index) => (
        <ElementPathNode key={index} color="textPrimary" node={node} />
      ))}
    </Breadcrumbs>
  );
};

export default ElementPathBreadcrumbs;

export const ElementPathNode: FunctionComponent<TypographyProps & { node: UiElementPathNode }> = ({ node, className, ...props }) => {
  const classes = useStyles();
  return (
    <Typography className={clsx(className, classes.node)}>
      {renderIcon(node, classes.icon)}
      {node.id}
    </Typography>
  );
};

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

    case 'context-item':
      return (
        <Tooltip title="Item de contexte de texte">
          <TextIcon className={className} />
        </Tooltip>
      );

    case 'map-item':
      return (
        <Tooltip title="Item de mapping d'image">
          <ImageIcon className={className} />
        </Tooltip>
      );

    default:
      throw new Error(`Unsupported node type: '${node.type}'`);
  }
}
