import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

import { name, version } from '../../../../package.json';
import { isOnline, getRunningRequestsIds } from '../../store/status/selectors';
import StatusBar, { StatusSeparator, StatusItem } from '../lib/status-bar';

const useStyles = makeStyles((theme) => ({
  errorIcon: {
    color: theme.palette.error.main,
  },
  waitingIcon: {
    color: theme.palette.warning.main,
  }
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
      <Typography>{`Connexion `}</Typography>
      {online ? <CheckIcon /> : <CloseIcon className={classes.errorIcon} />}
    </StatusItem>
  );
}

const RunningRequests: FunctionComponent = () => {
  const classes = useStyles();
  const ids = useSelector(getRunningRequestsIds);
  // TODO: popup with requests detail (when it becomes relevant)

  const count = ids.length;
  const name = count > 1 ? 'requêtes' : 'requête';

  return  (
    <StatusItem>
      <Typography>{`${count} ${name} en cours `}</Typography>
      {count > 0 ? <HourglassEmptyIcon className={classes.waitingIcon} /> : <CheckIcon />}
    </StatusItem>
  );
}
