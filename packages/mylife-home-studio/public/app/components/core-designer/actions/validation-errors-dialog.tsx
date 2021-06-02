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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';

import { TransitionProps, DialogText } from '../../dialogs/common';
import { CoreValidationError } from '../../../store/core-designer/types';

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
  const classes = useStyles();
  const [errors, setErrors] = useState<CoreValidationError[]>();
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

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Erreurs de validation</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Le projet a les erreurs de validation suivantes :'} />

            <List className={classes.list}>
              {errors.map((error, index) => (<ErrorItem key={index} error={error} />))}
            </List>

          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={close}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
    [errors, onClose]
  );

  return useCallback(
    (errors: CoreValidationError[]) =>
      new Promise<void>((resolve) => {
        setErrors(errors);
        setOnClose(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setErrors, setOnClose]
  );
}

const CHANGE_TYPES = {
  add: 'Plugin ajouté', // Note: ne devrait pas apparaître
  update: 'Plugin modifié',
  delete: 'Plugin suprimé'
};

const ErrorItem: FunctionComponent<{ error: CoreValidationError }> = ({ error }) => {
  const classes = useStyles();
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

            {(error.impacts || []).map(componentId => {
              <DetailLine key={componentId}>{`Impact sur le composant ${componentId}`}</DetailLine>
            })}

          </div>
        } />
    </ListItem>
  );
};

const DetailLine: FunctionComponent = ({ children }) => (
  <Typography variant="body2" color="textSecondary">{children}</Typography>
);
