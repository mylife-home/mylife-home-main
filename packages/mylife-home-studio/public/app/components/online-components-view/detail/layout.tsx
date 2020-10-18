import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { NodeType, ICONS_BY_TYPE } from '../common';

export const Title: FunctionComponent<{ type?: NodeType; title: string; }> = ({ type, title }) => {
  const Icon = ICONS_BY_TYPE[type] || React.Fragment;

  return (
    <Typography variant='h1'>
      <Icon />
      {title}
    </Typography>
  );
};