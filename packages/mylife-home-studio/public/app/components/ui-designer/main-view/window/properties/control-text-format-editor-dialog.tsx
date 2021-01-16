import React, { useState } from 'react';
import { useModal } from 'react-modal-hook';
import { Transition } from 'react-transition-group'; // used by material-ui
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { ControlText, ControlTextContextItem } from '../../../../../../../shared/ui-model';
import CodeEditor from './code-editor';

type TransitionProps = Transition<HTMLElement>['props'];

export type DialogResult = { status: 'ok' | 'cancel'; format?: string };

export function useFormatEditorDialog() {
  const [format, setFormat] = useState<string>();
  const [context, setContext] = useState<ControlTextContextItem[]>();
  const [onResult, setOnResult] = useState<(value: DialogResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    const cancel = () => {
      hideModal();
      onResult({ status: 'cancel' });
    };

    const validate = () => {
      hideModal();
      onResult({ status: 'ok', format });
    };

    return (
      <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="sm" fullWidth>
        <DialogTitle id="dialog-title">Format</DialogTitle>

        <DialogContent dividers>
          TODO: code editor (display code mirror + pouvoir tester la sortie en fournissant des valeurs de context)
          <CodeEditor value={format} onChange={setFormat} />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={validate}>OK</Button>
          <Button onClick={cancel}>Annuler</Button>
        </DialogActions>
      </Dialog>
    );
  }, [format, setFormat, context, onResult]);

  return (text: ControlText) => new Promise<DialogResult>(resolve => {
    // force new object creation
    setFormat(text.format);
    setContext(text.context);
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}
