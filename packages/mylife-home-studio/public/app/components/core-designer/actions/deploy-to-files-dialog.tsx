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
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText } from '../../dialogs/common';
import { DeployChanges } from '../../../../../shared/project-manager';
import DeployChangesList from './deploy-changes-list';

const useStyles = makeStyles((theme) => ({
  selector: {
    width: 200,
  },
  separator: {
    height: theme.spacing(8),
  },
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
  bindingsInstanceName: { actual: string; needed: boolean };
  changes: DeployChanges;
  files: string[];
}

export function useShowDhowDeployToFilesDialog() {
  const classes = useStyles();
  const [data, setData] = useState<DialogData>();
  const [onResult, setOnResult] = useState<(value: ChangesDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const [selectedbindingsInstanceName, selectBindingsInstanceName] = useState<string>(null);
      
      useEffect(() => {
        selectBindingsInstanceName(null);
      }, [data]);

      const { changes, bindingsInstanceName, files } = data;
      const currentBindingsInstanceName = bindingsInstanceName.needed ? selectedbindingsInstanceName : bindingsInstanceName.actual;
      const needBindingsInstanceName = bindingsInstanceName.needed;
      const canValidate = !needBindingsInstanceName || !!selectedbindingsInstanceName;

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };

      const validate = () => {
        if (!canValidate) {
          return;
        }

        hideModal();
        const bindingsInstanceName = needBindingsInstanceName ? selectedbindingsInstanceName : undefined;
        onResult({ status: 'ok', bindingsInstanceName });
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
            {needBindingsInstanceName && (
              <>
                <DialogText value={`L'instance de déploiement des bindings n'a pas pu être identifiée. Veuillez la sélectionner.`} />
                <BindingsInstanceNameSelector className={classes.selector} changes={changes} value={selectedbindingsInstanceName} onChange={selectBindingsInstanceName} />
                <Separator />
              </>
            )}

            <DialogText value={'Les changements suivants vont être effectués :'} />
            <DeployChangesList className={classes.changesList} changes={changes} bindingsInstanceName={currentBindingsInstanceName} />

            <Separator />

            <DialogText value={'Les fichiers suivants vont être créés :'} />
            <List className={classes.filesList}>
              {files.map((file) => (
                <ListItem key={file}>
                  <ListItemText primary={file} />
                </ListItem>
              ))}
              {bindingsInstanceName.needed && (
                <ListItem>
                  <ListItemText primary="(Instance pour bindings à définir)" />
                </ListItem>
              )}
            </List>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={validate} disabled={!canValidate}>
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
    (bindingsInstanceName: { actual: string; needed: boolean }, changes: DeployChanges, files: string[]) =>
      new Promise<ChangesDialogResult>((resolve) => {
        setData({ bindingsInstanceName, changes, files });
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setData, setOnResult, showModal]
  );
}

const Separator: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.separator} />
  )
}

const BindingsInstanceNameSelector: FunctionComponent<{ className?: string; changes: DeployChanges; value: string; onChange: (newValue: string) => void; }> = ({ className, changes, value, onChange }) => {
  const instancesNamesList = useMemo(() => buildInstancesNamesList(changes), [changes]);
  return (
    <Autocomplete
      className={className}
      value={value}
      onChange={(event: React.ChangeEvent, newValue: string) => { onChange(newValue); }}
      inputValue={value || ''}
      onInputChange={(event, newInputValue) => { onChange(newInputValue); }}
      options={instancesNamesList}
      disableClearable
      freeSolo
      renderInput={(params) => <TextField {...params} />}
    />
  );
};

function buildInstancesNamesList(changes: DeployChanges) {
  const instances = new Set<string>();
  for (const change of changes.components) {
    instances.add(change.instanceName);
  }

  return Array.from(instances).sort();
}

