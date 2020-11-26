import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

import { isOnline } from '../../store/status/selectors';

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'flex',
    alignItems: 'center',

    '& > svg': {
      marginRight: theme.spacing(2),
      fontSize: '1.4rem'
    },
  },
}));

const ConnectingDialog: FunctionComponent = () => {
  const classes = useStyles();
  const online = useSelector(isOnline);

  if (online) {
    return null;
  }

  return (
    <Dialog aria-labelledby="dialog-title" open={true} scroll="paper" maxWidth="xs">
      <DialogTitle id="dialog-title" className={classes.title} disableTypography>
        <HourglassEmptyIcon />
        <Typography component="h2" variant="h6">{`Connexion en cours ...`}</Typography>
      </DialogTitle>
    </Dialog>
  );
};

export default ConnectingDialog;
