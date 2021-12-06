import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { BusyDialog } from './busy';

import { isOnline } from '../../store/status/selectors';

const ConnectingDialog: FunctionComponent = () => {
  const online = useSelector(isOnline);

  if (online) {
    return null;
  }

  return (
    <BusyDialog title={'Connexion en cours ...'} />
  );
};

export default ConnectingDialog;
