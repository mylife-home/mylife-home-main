import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

export const useLayoutStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    marginTop: theme.spacing(3),
  },
  fullHeight: {
    flex: 1,
  },
  link: {
    marginLeft: theme.spacing(3),
  },
}));

export const Container: FunctionComponent<{ className?: string }> = ({ className, children }) => {
  const classes = useLayoutStyles();
  return <div className={clsx(classes.container, className)}>{children}</div>;
};

export const Item: FunctionComponent<{ fullHeight?: boolean }> = ({ fullHeight = false, children }) => {
  const classes = useLayoutStyles();
  return <div className={clsx(classes.item, { [classes.fullHeight]: fullHeight })}>{children}</div>;
};

export const Section: FunctionComponent<{ title: string }> = ({ title }) => {
  const classes = useLayoutStyles();
  return (
    <Item>
      <Typography variant="h6">{title}</Typography>
    </Item>
  );
};

export const ItemLink: FunctionComponent<{ text: string; onClick: () => void }> = ({ text, onClick }) => {
  const classes = useLayoutStyles();
  return (
    <Item>
      <Link className={classes.link} component="button" variant="body1" onClick={onClick}>
        {text}
      </Link>
    </Item>
  );
};
