import React, { FunctionComponent } from 'react';
import { ModalProvider } from 'react-modal-hook';
import { SnackbarProvider } from 'notistack';
import { TransitionGroup } from 'react-transition-group'; // used by material-ui
import ErrorDialog from './error';
import ConnectingDialog from './connecting';

const DialogProvider: FunctionComponent = ({ children }) => (
  <SnackbarProvider dense>
    <ModalProvider rootComponent={TransitionGroup}>
      <ErrorDialog />
      <ConnectingDialog />
      {children}
    </ModalProvider>
  </SnackbarProvider>
);

export default DialogProvider;