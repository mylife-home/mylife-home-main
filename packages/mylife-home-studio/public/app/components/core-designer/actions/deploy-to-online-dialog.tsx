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

export function useShowDhowDeployToFilesDialog() {
  const [data, setData] = useState<{ changes: DeployChanges; bindingsInstanceName: string; }>();
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
            <DeployChangesList changes={data.changes} bindingsInstanceName={data.bindingsInstanceName} />

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
    [data, onResult]
  );

  return useCallback(
    (changes: DeployChanges, bindingsInstanceName: string) =>
      new Promise<ConfirmResult>((resolve) => {
        setData({ changes, bindingsInstanceName });
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setData, setOnResult, showModal]
  );
}
