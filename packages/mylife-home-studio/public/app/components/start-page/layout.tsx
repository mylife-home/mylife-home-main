import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(3),
  },
  link: {
    marginLeft: theme.spacing(3),
  },
}));

export const Container: FunctionComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <Grid container spacing={3} className={classes.container}>
      {children}
    </Grid>
  );
};

export const Section: FunctionComponent<{ title: string }> = ({ title }) => {
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      <Typography variant="h6">{title}</Typography>
    </Grid>
  );
};

export const Item: FunctionComponent = ({ children }) => (
  <Grid item xs={12}>
    {children}
  </Grid>
);

export const ItemLink: FunctionComponent<{ text: string; onClick: () => void }> = ({ text, onClick }) => {
  const classes = useStyles();
  return (
    <Item>
      <Link className={classes.link} component="button" variant="body1" onClick={onClick}>
        {text}
      </Link>
    </Item>
  );
};
