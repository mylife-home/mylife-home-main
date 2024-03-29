import React, { useState } from 'react';
import { useModal } from 'react-modal-hook';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { TransitionProps, DialogText } from './common';

export type InputResult = { status: 'ok' | 'cancel'; text?: string; };

export interface InputOptions {
  initialText?: string;
  title?: string;
  message?: string;
  label?: string;
  validator?: (text: string) => string;
}

export function useInputDialog() {
  const [options, setOptions] = useState<Omit<InputOptions, 'initialText'>>();
  const [text, setText] = useState<string>();
  const [onResult, setOnResult] = useState<(value: InputResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    const { title, message, label, validator } = options;
    
    const error = validator(text);

    const cancel = () => {
      hideModal();
      onResult({ status: 'cancel' });
    };

    const validate = () => {
      if (error) {
        return;
      }

      hideModal();
      onResult({ status: 'ok', text });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        validate();
      }
    };

    return (
      <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} onEscapeKeyDown={cancel} scroll="paper" maxWidth="sm" fullWidth>
        {title && <DialogTitle id="dialog-title">{title}</DialogTitle>}

        <DialogContent dividers>
          <DialogText value={message} />
          <TextField autoFocus fullWidth label={label} id="text" value={text || ''} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} error={!!error} helperText={error} />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={validate}>OK</Button>
          <Button onClick={cancel}>Annuler</Button>
        </DialogActions>
      </Dialog>
    );
  }, [options, text, setText, onResult]);

  return ({ initialText, title, message, label, validator = () => null }: InputOptions) => new Promise<InputResult>(resolve => {
    // force new object creation
    setOptions({ title, message, label, validator });
    setText(initialText);
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}
