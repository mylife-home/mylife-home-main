import React, { FunctionComponent, useCallback, useState, useMemo, useEffect } from 'react';
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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText } from '../../dialogs/common';
import { coreImportData, DeployChanges } from '../../../../../shared/project-manager';
import DeployChangesList from './deploy-changes-list';

const useStyles = makeStyles((theme) => ({
  changesList: {
    height: '40vh',
  },
  filesList: {
    height: '20vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

type ChangesDialogResult = ConfirmResult & { bindingsInstanceName?: string };

interface DialogData {
  bindingsInstanceName: { actual: string, needed: boolean };
  changes: DeployChanges;
  files: string[];
}

export function useShowDhowDeployToFilesDialog() {
  const classes = useStyles();
  const [data, setData] = useState<DialogData>();
  const [selectedbindingsInstanceName, selectBindingsInstanceName] = useState<string>(null);
  const [onResult, setOnResult] = useState<(value: ChangesDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const { changes, bindingsInstanceName, files } = data;
      const currentBindingsInstanceName = bindingsInstanceName.needed ? selectedbindingsInstanceName : bindingsInstanceName.actual;

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };

      const validate = () => {
        hideModal();
        onResult({ status: 'ok', bindingsInstanceName: 'TODO' });
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

            <DeployChangesList className={classes.changesList} changes={changes} bindingsInstanceName={currentBindingsInstanceName}/>

            <DialogText value={'bindingsInstanceName'} />

            <DialogText value={'Les fichiers suivants vont être créés :'} />

            <List className={classes.filesList}>
            </List>
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
    (bindingsInstanceName: { actual: string, needed: boolean }, changes: DeployChanges, files: string[]) =>
      new Promise<ChangesDialogResult>((resolve) => {
        setData({ bindingsInstanceName, changes, files });
        selectBindingsInstanceName(null);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setData, setOnResult, showModal]
  );
}
