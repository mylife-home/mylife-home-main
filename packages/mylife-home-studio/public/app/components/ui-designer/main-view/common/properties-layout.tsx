import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  group: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    width: 200,
  }
}));

export const Group: FunctionComponent<{ title: string }> = ({ title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.group}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </div>
  );
};

export const Item: FunctionComponent<{ title: string }> = ({ title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      <Typography className={classes.itemTitle}>{title}</Typography>
      {children}
    </div>
  );
}

export const useComponentStyles = makeStyles((theme) => ({
  component: {
    width: '100%',
  },
}));