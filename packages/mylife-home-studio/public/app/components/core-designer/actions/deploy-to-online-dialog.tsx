import React, { useCallback, useState } from 'react';
import { useModal } from 'react-modal-hook';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText, DialogSeparator } from '../../dialogs/common';
import { DeployChanges } from '../../../../../shared/project-manager';
import DeployChangesList from './deploy-changes-list';

export function useShowDhowDeployToOnlineDialog() {
  const [changes, setChanges] = useState<DeployChanges>();
  const [onResult, setOnResult] = useState<(value: ConfirmResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {

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
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Opérations à effectuer pour le déploiement</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Les changements suivants vont être effectués :'} />
            <DeployChangesList changes={changes} />

            <DialogSeparator />
            <DialogText value={'Continuer ?'} />
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={validate}>
              OK
            </Button>
            <Button onClick={cancel}>Annuler</Button>
          </DialogActions>
        </Dialog>
      );
    },
    [changes, onResult]
  );

  return useCallback(
    (changes: DeployChanges) =>
      new Promise<ConfirmResult>((resolve) => {
        setChanges(changes);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setChanges, setOnResult, showModal]
  );
}
