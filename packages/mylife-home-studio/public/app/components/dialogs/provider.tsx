import React, { FunctionComponent } from 'react';
import { ModalProvider } from 'react-modal-hook';
import { TransitionGroup } from 'react-transition-group'; // used by material-ui

const DialogProvider: FunctionComponent = ({ children }) => (
  <ModalProvider rootComponent={TransitionGroup}>
    {children}
  </ModalProvider>
);

export default DialogProvider;