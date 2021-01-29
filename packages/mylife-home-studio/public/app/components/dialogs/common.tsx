import React, { FunctionComponent, useMemo } from 'react';
import { Transition } from 'react-transition-group'; // used by material-ui
import Typography from '@material-ui/core/Typography';

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