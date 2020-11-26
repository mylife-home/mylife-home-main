import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';

import { name, version } from '../../../../package.json';
import { isOnline } from '../../store/status/selectors';
import StatusBar, { StatusSeparator, StatusItem } from '../lib/status-bar';

const useStyles = makeStyles((theme) => ({
  errorIcon: {
    color: theme.palette.error.main,
  },
}));

const Status: FunctionComponent<{className ?: string; }> = ({ className }) => {
  return (
    <StatusBar className={className}>
      <Version />

      <StatusSeparator />

      <RunningRequests />
      <Connection />
    </StatusBar>
  );
};

export default Status;

const Version: FunctionComponent = () => {
  return <Typography>{`${name} v${version}`}</Typography>;
}

const Connection: FunctionComponent = () => {
  const classes = useStyles();
  const online = useSelector(isOnline);

  return (
    <StatusItem>
      <Typography>Connexion : </Typography>
      {online ? <CheckIcon /> : <CloseIcon className={classes.errorIcon} />}
    </StatusItem>
  );
}

const RunningRequests: FunctionComponent = () => {
  return <Typography>RunningRequests</Typography>;
}
