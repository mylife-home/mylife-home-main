import React, { useState } from 'react';
import { useModal } from 'react-modal-hook';
import { Transition } from 'react-transition-group'; // used by material-ui
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { DialogText } from '../../../dialogs/common';
import { ConfirmResult } from '../../../dialogs/confirm';
import { Usage } from '../../../../store/ui-designer/types';
import UsageBreadcrumbs from './usage-breadcrumbs';

type TransitionProps = Transition<HTMLElement>['props'];

interface DialogOptions {
  title: string;
  message: string;
  usage: Usage;
}

export function useRemoveUsageConfirmDialog() {

  const [options, setOptions] = useState<DialogOptions>();
  const [onResult, setOnResult] = useState<(value: ConfirmResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    const { title, message, usage } = options;

    const cancel = () => {
      hideModal();
      onResult({ status: 'cancel' });
    };

    const validate = () => {
      hideModal();
      onResult({ status: 'ok' });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          validate();
          break;
        
        case 'Escape':
          cancel();
          break;
      }
    };

    return (
      <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
        <DialogTitle id="dialog-title">{title}</DialogTitle>

        <DialogContent dividers>
          <DialogText value={message} />
          <List>
            {usage.map((item, index) => (
              <ListItem key={index}>
                <UsageBreadcrumbs item={item} />
              </ListItem>
            ))}
          </List>
          <DialogText value="Supprimer quand même ?" />
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={validate}>OK</Button>
          <Button onClick={cancel}>Annuler</Button>
        </DialogActions>
      </Dialog>
    );
  }, [options, onResult]);

  return ({ title, message, usage }: DialogOptions) => new Promise<ConfirmResult>(resolve => {
    setOptions({ title, message, usage });
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}