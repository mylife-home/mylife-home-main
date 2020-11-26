import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import StatusBar, { StatusSeparator } from '../lib/status-bar';

import { version } from '../../../../package.json';

const useStyles = makeStyles((theme) => ({
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
  return <Typography>{`v${version}`}</Typography>;
}

const Connection: FunctionComponent = () => {
  return <Typography>Connection</Typography>;
}

const RunningRequests: FunctionComponent = () => {
  return <Typography>RunningRequests</Typography>;
}
