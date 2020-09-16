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
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',

    '& > *': {
      margin: theme.spacing(1),
    }
  },
  name: {
    width: '50ch',
  },
  instance: {
    width: '25ch',
  },
  message: {
    width: '50ch',
  }
}));

interface CriteriaProps {
  className?: string;
}

const Criteria: FunctionComponent<CriteriaProps> = ({ className }) => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, className)}>
      <TextField label='Nom' className={classes.name} />
      <TextField label='Instance' className={classes.instance} />
      <TextField label='Message' className={classes.message} />
      <FormControlLabel label='Erreur' control={<Checkbox color='primary' />} />
      <Button>Niveau</Button>
    </div>
  );
};

export default Criteria;

// name with wildcards
// instanceName
// msg contains
// !!err
// level min-max