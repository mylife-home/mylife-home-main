import React, { FunctionComponent } from 'react';
import { ModalProvider } from 'react-modal-hook';
import { TransitionGroup } from 'react-transition-group'; // used by material-ui
import ErrorDialog from './error';

const DialogProvider: FunctionComponent = ({ children }) => (
  <ModalProvider rootComponent={TransitionGroup}>
    <ErrorDialog />
    {children}
  </ModalProvider>
);

export default DialogProvider;