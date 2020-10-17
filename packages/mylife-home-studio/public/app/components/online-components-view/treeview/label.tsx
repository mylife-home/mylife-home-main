import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';

import { InstanceIcon, PluginIcon, ComponentIcon, StateIcon } from '../../lib/icons';
import { NodeType } from '../types';

const useLabelStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  flashing: {
    animationPlayState: 'running !important'
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
    from: {
    },
    to: {
      backgroundColor: 'black',
    },
  },
  flash: {
    animationName: '$flash',
    animationDuration: '1000ms',
    animationIterationCount: 1,
    animationDirection: 'alternate',
    animationTimingFunction: 'ease-in-out',
    animationPlayState: 'paused',
  },

}));

const ICONS_BY_TYPE: { [type in NodeType]: typeof SvgIcon } = {
  instance: InstanceIcon,
  plugin: PluginIcon,
  component: ComponentIcon,
  state: StateIcon,
};

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
  return <Typography className={clsx(classes.part, classes.flash, { [classes.bold]: bold, [classes.flashing]: flashing })}>{children}</Typography>;
};
