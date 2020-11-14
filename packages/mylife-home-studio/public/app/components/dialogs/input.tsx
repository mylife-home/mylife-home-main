import React, { FunctionComponent, useCallback, useState } from 'react';
import { useModal } from 'react-modal-hook';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Transition } from 'react-transition-group'; // used by material-ui

type TransitionProps = Transition<HTMLElement>['props'];

export type Result = { status: 'ok' | 'cancel'; text?: string };

export interface InputOptions {
  initialText?: string;
  title?: string;
  message?: string;
  label?: string;
}

export function useInputDialog() {
  const [options, setOptions] = useState<Omit<InputOptions, 'initialText'>>();
  const [text, setText] = useState<string>();
  const [onResult, setOnResult] = useState<(value: Result) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    const { title, message, label } = options;
    const cancel = () => {
      hideModal();
      onResult({ status: 'cancel' });
    };

    const validate = () => {
      hideModal();
      onResult({ status: 'ok', text });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        validate();
      }
    };

    return (
      <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="sm" fullWidth>
        {title && <DialogTitle id="dialog-title">{title}</DialogTitle>}

        <DialogContent dividers>
          {message && <DialogContentText>{message}</DialogContentText>}
          <TextField autoFocus fullWidth label={label} id="text" value={text || ''} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={validate}>
            OK
          </Button>
          <Button onClick={cancel}>Annuler</Button>
        </DialogActions>
      </Dialog>
    );
  }, [options, text, setText, onResult]);

  return ({ initialText, title, message, label }: InputOptions) => new Promise<Result>(resolve => {
    // force new object creation
    setOptions({ title, message, label });
    setText(initialText);
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}
