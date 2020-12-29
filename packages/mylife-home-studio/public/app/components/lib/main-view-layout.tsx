import React, { FunctionComponent, ReactNode } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const useTitleStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),

    '& *': {
      marginRight: theme.spacing(3),
    },
  },
}));

export const Title: FunctionComponent<{ className?: string; text: string; icon?: typeof SvgIcon }> = ({ className, text, icon }) => {
  const classes = useTitleStyles();
  const Icon = icon || React.Fragment;

  return (
    <div className={clsx(classes.container, className)}>
      <Icon />
      <Typography variant="h6">{text}</Typography>
    </div>
  );
};

const useContainerStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'column',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    margin: theme.spacing(3),

    '& > *': {
      marginRight: theme.spacing(8),
    },
  },
  contentWrapper: {
    flex: 1,
    overflowY: 'auto',
  },
}));

export const Container: FunctionComponent<{ title: ReactNode }> = ({ title, children }) => {
  const classes = useContainerStyles();

  return (
    <div className={classes.container}>
      <div className={classes.titleContainer}>{title}</div>

      <Divider />

      <div className={classes.contentWrapper}>{children}</div>
    </div>
  );
};
