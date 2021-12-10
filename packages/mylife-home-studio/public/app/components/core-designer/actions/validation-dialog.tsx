import React, { FunctionComponent, useCallback, useState, useMemo } from 'react';
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
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

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
  },
  error: {
    color: theme.palette.error.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  info: {
    color: theme.palette.info.main,
  }
}));

export function useShowValidationDialog({ isConfirm = false }: { isConfirm?: boolean } = {}) {
  const [validation, setValidation] = useState<coreValidation.Item[]>();
  const [onResult, setOnResult] = useState<(value: ConfirmResult) => void>();

  const canValidate = useMemo(() => validation && !validation.find(item => item.severity === 'error'), [validation]);
  const hasChoice = isConfirm && canValidate;

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const classes = useStyles();

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
            if (hasChoice) {
              validate();
            } else {
              cancel();
            }
            break;

          case 'Escape':
            cancel();
            break;
        }
      };

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Problèmes de validation</DialogTitle>
    
          <DialogContent dividers>
            <DialogText value={'Le projet a les problèmes de validation suivants :'} />
    
            <List className={classes.list}>
              {validation.map((item, index) => (<ValidationItem key={index} item={item} />))}
            </List>

            {hasChoice && (
              <>
                <DialogSeparator />

                <DialogText value={'Continuer ?'} />
              </>
            )}
    
          </DialogContent>
    
          <DialogActions>
            {hasChoice ? (
              <>
                <Button color="primary" onClick={validate}>
                  Oui
                </Button>

                <Button onClick={cancel}>
                  Non
                </Button>
              </>
            ) : (
              <Button color="primary" onClick={cancel}>
                OK
              </Button>
            )}
          </DialogActions>
        </Dialog>
      );
    },
    [validation, onResult]
  );

  return useCallback(
    (validation: coreValidation.Item[]) =>
      new Promise<ConfirmResult>((resolve) => {
        setValidation(validation);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        console.log('useShowValidationDialog', validation);

        showModal();
      }),
    [setValidation, setOnResult]
  );
}

interface ValidationDisplay {
  title: string;
  details: string[];
}

const ValidationItem: FunctionComponent<{ item: coreValidation.Item }> = ({ item }) => {
  const classes = useStyles();
  const { title, details } = useMemo(() => getValidationDisplay(item), [item]);

  return (
    <ListItem alignItems='flex-start'>
      <ListItemIcon>
        <SeverityIcon severity={item.severity} />
      </ListItemIcon>

      <ListItemText
        disableTypography
        primary={<Typography variant="body1">{title}</Typography>}
        secondary={
          <div className={classes.detailsContainer}>
            {details.map((line, index) => (
              <Typography key={index} variant="body2" color="textSecondary">{line}</Typography>
            ))}
          </div>
        } />
    </ListItem>
  );
};

const SeverityIcon: FunctionComponent<{ severity: coreValidation.Severity }> = ({ severity }) => {
  const classes = useStyles();

  switch(severity) {
    case 'error':
      return <ErrorIcon className={classes.error} />;

    case 'warning':
      return <WarningIcon className={classes.warning} />;

    case 'info':
      return <InfoOutlinedIcon className={classes.info} />;
  }
};

function getValidationDisplay(item: coreValidation.Item): ValidationDisplay {
  switch (item.type) {
    case 'plugin-changed':
      return getPluginChangedDisplay(item as coreValidation.PluginChanged);

    case 'existing-component-id':
      return getExistingComponentIdDisplay(item as coreValidation.ExistingComponentId);
      
    case 'missing-external-component':
    case 'invalid-binding-api':
    case 'component-bad-config':
    case 'binding-mismatch':
      return { title: 'TODO', details: [] };
  }
}

const CHANGE_TYPES = {
  add: 'Plugin ajouté', // ne devrait pas apparaître
  update: 'Plugin mis à jour',
  delete: 'Plugin inexistant'
};

function getPluginChangedDisplay(item: coreValidation.PluginChanged) {
  const display: ValidationDisplay = {
    title: `${CHANGE_TYPES[item.changeType]} - ${item.instanceName}:${item.module}.${item.name}`,
    details: []
  };

  for (const [memberName, type] of Object.entries(item.members || {})) {
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

    display.details.push(`${changeType} : ${memberName}`);
  }

  for (const [configName, type] of Object.entries(item.config || {})) {
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

    display.details.push(`${changeType} : ${configName}`);
  }

  for (const componentId of item.impacts || []) {
    display.details.push(`Impact sur le composant ${componentId}`);
  }

  return display;
}

function getExistingComponentIdDisplay(item: coreValidation.ExistingComponentId) {
  const display: ValidationDisplay = {
    title: `Composant déjà existant - ${item.componentId}`,
    details: [
      `Existant: ${item.existing.instanceName}:${item.existing.module}.${item.existing.name}`,
      `A livrer: ${item.project.instanceName}:${item.project.module}.${item.project.name}`,
    ]
  };

  return display;
}