import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import StatusBar, { StatusSeparator } from '../lib/status-bar';

const useStyles = makeStyles((theme) => ({
}));

const Status: FunctionComponent<{className ?: string; }> = ({ className }) => {
  return (
    <StatusBar className={className}>
      TODO left
      <StatusSeparator />
      TODO right
    </StatusBar>
  );
};

export default Status;
