import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { NodeType, ICONS_BY_TYPE } from '../common';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: theme.spacing(3),

    '& *': {
      marginRight: theme.spacing(3),
    }
  }
}));

export const Title: FunctionComponent<{ type?: NodeType; title: string; }> = ({ type, title }) => {
  const classes = useStyles();
  const Icon = ICONS_BY_TYPE[type] || React.Fragment;

  return (
    <div className={classes.container}>
      <Icon />
      <Typography variant='h6' >
        {title}
      </Typography>
    </div>
  );
};