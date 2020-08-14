import React, { forwardRef } from 'react';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import InputIcon from '@material-ui/icons/Input';

import { useComponentStyles } from './styles';

export type PropType = 'state' | 'action';

export interface PropProps {
  type: PropType;
  children: React.ReactNode;
}

const Prop = forwardRef<HTMLDivElement, PropProps>(({ type, children }, ref) => {
  const classes = useComponentStyles();

  return (
    <div className={clsx(classes.item, classes.prop, classes[type])}>
      {getIcon(type)}
      <Typography>
        {children}
      </Typography>
    </div>
  );
});

export default Prop;

function getIcon(type: PropType) {
  switch(type) {
    case 'state':
      return (<VisibilityIcon />);
    case 'action': 
      return (<InputIcon />);
  }
}