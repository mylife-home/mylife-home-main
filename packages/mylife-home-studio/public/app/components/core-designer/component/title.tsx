import React, { forwardRef } from 'react';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';

import { useComponentStyles } from './styles';

const Title = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  const classes = useComponentStyles();

  return (
    <div ref={ref} className={clsx(classes.item, classes.title)}>
      <Typography>
        {children}
      </Typography>
    </div>
  );
});

export default Title;