import React, { useState } from 'react';
import { useModal } from 'react-modal-hook';
import { Transition } from 'react-transition-group'; // used by material-ui
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { DialogText } from './common';

type TransitionProps = Transition<HTMLElement>['props'];

export type ConfirmResult = { status: 'ok' | 'cancel'; };

export interface ConfirmOptions {
  title?: string;
  message?: string;
}

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions>();
  const [onResult, setOnResult] = useState<(value: ConfirmResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    const { title, message } = options;

    const cancel = () => {
      hideModal();
      onResult({ status: 'cancel' });
    };

    const validate = () => {
      hideModal();
      onResult({ status: 'ok' });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        validate();
      }
    };

    return (
      <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} onEscapeKeyDown={cancel} scroll="paper" maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
        {title && <DialogTitle id="dialog-title">{title}</DialogTitle>}

        <DialogContent dividers>
          <DialogText value={message} />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={validate}>OK</Button>
          <Button onClick={cancel}>Annuler</Button>
        </DialogActions>
      </Dialog>
    );
  }, [options, onResult]);

  return ({ title, message }: ConfirmOptions) => new Promise<ConfirmResult>(resolve => {
    // force new object creation
    setOptions({ title, message });
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}
