import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

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

export const BusyDialog: FunctionComponent<{title: string; }> = ({ title }) => {
  const classes = useStyles();

  return (
    <Dialog aria-labelledby="dialog-title" open={true} scroll="paper" maxWidth="xs">
      <DialogTitle id="dialog-title" className={classes.title} disableTypography>
        <HourglassEmptyIcon />
        <Typography component="h2" variant="h6">{title}</Typography>
      </DialogTitle>
    </Dialog>
  );
};
