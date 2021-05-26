import React, { useCallback, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText } from '../../dialogs/common';
import { CoreBreakingOperation } from '../../../../../shared/project-manager';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  operationItem: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  usageItem: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),

    paddingLeft: theme.spacing(8)
  }
}));

export function useShowBreakingOperationsDialog() {
  const classes = useStyles();
  const [breakingOperations, setBreakingOperations] = useState<CoreBreakingOperation[]>();
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
          <DialogTitle id="dialog-title">Changements engendrés</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Importer les composants modifierait le projet :'} />

            <List className={classes.list}>
            </List>

            <DialogText value={'Continuer ?'} />
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={validate}>OK</Button>
            <Button onClick={cancel}>Annuler</Button>
          </DialogActions>
        </Dialog>
      );
    },
    [breakingOperations, onResult]
  );

  return useCallback(
    (breakingOperations: CoreBreakingOperation[]) =>
      new Promise<ConfirmResult>((resolve) => {
        setBreakingOperations(breakingOperations);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setBreakingOperations, setOnResult, showModal]
  );
}
