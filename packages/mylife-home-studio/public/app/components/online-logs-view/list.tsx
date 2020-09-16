import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: 'red',
  },
}));

interface ListProps {
  className?: string;
}

const List: FunctionComponent<ListProps> = ({ className }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      TODO
    </div>
  );
};

export default List;
