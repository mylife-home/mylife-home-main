import React, { FunctionComponent, createRef } from 'react';
import { ModalProvider } from 'react-modal-hook';
import { SnackbarProvider, SnackbarKey } from 'notistack';
import { TransitionGroup } from 'react-transition-group'; // used by material-ui
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ErrorDialog from './error';
import ConnectingDialog from './connecting';

const DialogProvider: FunctionComponent = ({ children }) => {
  return (
    <SnackbarCustomizedProvider>
      <ModalProvider rootComponent={TransitionGroup}>
        <ErrorDialog />
        <ConnectingDialog />
        {children}
      </ModalProvider>
    </SnackbarCustomizedProvider>
  );
};

export default DialogProvider;

const SnackbarCustomizedProvider: FunctionComponent = ({ children }) => {
  const notistackRef = createRef<SnackbarProvider>();

  const onClickDismiss = (key: SnackbarKey) => () => { 
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      dense
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      ref={notistackRef}
      action={(key) => (
        <IconButton onClick={onClickDismiss(key)} color='inherit'>
          <CloseIcon />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};
