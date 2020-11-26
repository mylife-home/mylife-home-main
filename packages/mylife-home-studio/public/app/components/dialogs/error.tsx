import React, { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { useAction } from '../lib/use-actions';
import { DialogText } from './common';
import { getError } from '../../store/status/selectors';
import { clearError } from '../../store/status/actions';

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.main,

    '& > svg': {
      marginRight: theme.spacing(2),
      fontSize: '1.4rem'
    },
  },
  textContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  text: {
    flex: 1,
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const ErrorDialog: FunctionComponent = () => {
  const classes = useStyles();
  const error = useSelector(getError);
  const close = useAction(clearError);

  if (!error) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        close();
        break;
    }
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={true} onClose={close} scroll="paper" maxWidth="sm" fullWidth onKeyDown={handleKeyDown} disableBackdropClick>
      <DialogTitle id="dialog-title" className={classes.title} disableTypography>
        <ErrorIcon />
        <Typography component="h2" variant="h6">{`Erreur`}</Typography>
      </DialogTitle>

      <Content error={error} />

      <DialogActions>
        <Button color="primary" onClick={close}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;

const Content: FunctionComponent<{ error: Error }> = ({ error }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(value => !value);

  return (
    <DialogContent dividers>

      <div className = {classes.textContainer}>
        <div className={classes.text}>
          <DialogText value={error.message} />
        </div>

        <IconButton onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </div>
      
      <Collapse in={open}>
        <Divider className={classes.divider} />
        <DialogText value={error.stack} />
      </Collapse>
    </DialogContent>
  );
};
