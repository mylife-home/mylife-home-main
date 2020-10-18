import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';

import { NodeType, ICONS_BY_TYPE } from '../common';

const useLabelStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(3),
  },
  part: {
    marginRight: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  },
  '@keyframes flash': {
    '0%': {
      backgroundColor: 'none',
      color: 'inherit',
    },
    '25%': {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    '50%': {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    '100%': {
      backgroundColor: 'none',
      color: 'inherit',
    }
  },
  flash: {
    willChange: 'auto',
    animation: '$flash 0.5s',
  },

}));

export const LabelContainer: FunctionComponent = ({ children }) => {
  const classes = useLabelStyles();
  return <div className={classes.container}>{children}</div>;
};

export const LabelIcon: FunctionComponent<{ type: NodeType }> = ({ type }) => {
  const classes = useLabelStyles();
  const Icon = ICONS_BY_TYPE[type];

  return <Icon className={classes.icon} />;
};

export const LabelPart: FunctionComponent<{ flashing?: boolean; bold?: boolean }> = ({ flashing = false, bold = false, children }) => {
  const classes = useLabelStyles();
  return <Typography className={clsx(classes.part, { [classes.bold]: bold, [classes.flash]: flashing })}>{children}</Typography>;
};
