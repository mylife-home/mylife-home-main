import React, { FunctionComponent, useCallback, useState } from 'react';
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
import Typography from '@material-ui/core/Typography';

import { TransitionProps, DialogText, DialogSeparator } from '../../dialogs/common';
import { ConfirmResult } from '../../dialogs/confirm';
import { coreValidation } from '../../../store/core-designer/types';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
  }
}));

export function useShowValidationErrorsDialog() {
  const [validation, setValidation] = useState<coreValidation.Item[]>();
  const [onClose, setOnClose] = useState<() => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const close = () => {
        hideModal();
        onClose();
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Enter':
          case 'Escape':
            close();
            break;
        }
      };

      const actions = (
        <Button color="primary" onClick={close}>
          OK
        </Button>
      );

      return (
        <ValidationDialog open={open} onExited={onExited} onClose={close} onKeyDown={handleKeyDown} validation={validation} actions={actions} />
      );
    },
    [validation, onClose]
  );

  return useCallback(
    (validation: coreValidation.Item[]) =>
      new Promise<void>((resolve) => {
        setValidation(validation);
        setOnClose(() => resolve); // else useState think resolve is a state updater

        console.log('useShowValidationErrorsDialog', validation);

        showModal();
      }),
    [setValidation, setOnClose]
  );
}

export function useConfirmValidationErrorsDialog() {
  const [validation, setValidation] = useState<coreValidation.Item[]>();
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

      const contentBottom=(
        <>
          <DialogSeparator />
          <DialogText value={'Continuer ?'} />
        </>
      );

      const actions = (
        <>
          <Button color="primary" onClick={validate}>
            Oui
          </Button>

          <Button onClick={cancel}>
            Non
          </Button>
        </>
      );

      return (
        <ValidationDialog open={open} onExited={onExited} onClose={close} onKeyDown={handleKeyDown} validation={validation} contentBottom={contentBottom} actions={actions} />
      );
    },
    [validation, onResult]
  );

  return useCallback(
    (validation: coreValidation.Item[]) =>
      new Promise<ConfirmResult>((resolve) => {
        setValidation(validation);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        console.log('useConfirmValidationErrorsDialog', validation);

        showModal();
      }),
    [setValidation, setOnResult]
  );
}

interface ValidationDialogProps {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;

  validation: coreValidation.Item[];
  contentBottom?: React.ReactNode;
  actions: React.ReactNode;
}

const ValidationDialog: FunctionComponent<ValidationDialogProps> = ({ open, onExited, onClose, onKeyDown, validation, contentBottom, actions }) => {
  const classes = useStyles();

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="lg" fullWidth onKeyDown={onKeyDown}>
      <DialogTitle id="dialog-title">Erreurs de validation</DialogTitle>

      <DialogContent dividers>
        <DialogText value={'Le projet a les erreurs de validation suivantes :'} />

        <List className={classes.list}>
          {validation.map((item, index) => (<ValidationItem key={index} item={item} />))}
        </List>

        {contentBottom}

      </DialogContent>

      <DialogActions>
        {actions}
      </DialogActions>
    </Dialog>
  );
};

const CHANGE_TYPES = {
  add: 'Plugin ajouté', // ne devrait pas apparaître
  update: 'Plugin mis à jour',
  delete: 'Plugin inexistant'
};

const ValidationItem: FunctionComponent<{ item: coreValidation.Item }> = ({ item }) => {
  const classes = useStyles();
  const error = item as coreValidation.PluginChanged; // TODO: others
  const title = `${error.instanceName}:${error.module}.${error.name}`;

  return (
    <ListItem>
      <ListItemText
        disableTypography
        primary={<Typography variant="body1">{title}</Typography>}
        secondary={
          <div className={classes.detailsContainer}>
            <DetailLine>{CHANGE_TYPES[error.changeType]}</DetailLine>

            {Object.entries(error.members || {}).map(([memberName, type]) => {
              let changeType: string;

              switch(type) {
                case 'add':
                  changeType = 'Ajout de membre';
                  break;

                case 'update':
                  changeType = 'Modification de membre';
                  break;

                case 'delete':
                  changeType = 'Suppression de membre';
                  break;
              }

              return (
                <DetailLine key={memberName}>{`${changeType} : ${memberName}`}</DetailLine>
              );
            })}

            {Object.entries(error.config || {}).map(([configName, type]) => {
              let changeType: string;

              switch(type) {
                case 'add':
                  changeType = 'Ajout de configuration';
                  break;

                case 'update':
                  changeType = 'Modification de configuration';
                  break;

                case 'delete':
                  changeType = 'Suppression de configuration';
                  break;
              }

              return (
                <DetailLine key={configName}>{`${changeType} : ${configName}`}</DetailLine>
              );
            })}

            {(error.impacts || []).map(componentId => (
              <DetailLine key={componentId}>{`Impact sur le composant ${componentId}`}</DetailLine>
            ))}

          </div>
        } />
    </ListItem>
  );
};

const DetailLine: FunctionComponent = ({ children }) => (
  <Typography variant="body2" color="textSecondary">{children}</Typography>
);
