import React, { FunctionComponent, useMemo } from 'react';
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
