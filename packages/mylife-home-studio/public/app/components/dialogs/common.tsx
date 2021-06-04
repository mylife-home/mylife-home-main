import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Transition } from 'react-transition-group'; // used by material-ui
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  separator: {
    height: theme.spacing(8),
  },
}));

export const DialogText: FunctionComponent<{ value?: string; }> = ({ value }) => {
  const lines = useMemo(() => (value ||'').split('\n'), [value]);
  return (
    <>
      {lines.map((line, index) => (
        <Typography gutterBottom key={`${index}-${line}`}>
          {line}
        </Typography>
      ))}
    </>
  );
};

export type TransitionProps = Transition<HTMLElement>['props'];

export const DialogSeparator: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.separator} />
  );
};