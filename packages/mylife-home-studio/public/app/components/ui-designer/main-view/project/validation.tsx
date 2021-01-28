import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from 'react-modal-hook';
import { Transition } from 'react-transition-group'; // used by material-ui
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

import { DialogText } from '../../../dialogs/common';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { validateProject } from '../../../../store/ui-designer/actions';
import ElementPathBreadcrumbs from '../common/element-path-breadcrumbs';
import { UiValidationError } from '../../../../../../shared/project-manager';
import { useSnackbar } from '../../../dialogs/snackbar';

type TransitionProps = Transition<HTMLElement>['props'];

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const showDialog = useShowDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const errors = await dispatch(validateProject({ id: tabId })) as unknown as UiValidationError[];
      if (errors.length === 0) {
        enqueueSnackbar('Le projet a été validé sans erreur.', { variant: 'success' });
      } else {
        await showDialog(errors);
      }
    });
  }, [tabId, dispatch, fireAsync]);
}

function useShowDialog() {
  const classes = useStyles();
  const [errors, setErrors] = useState<UiValidationError[]>();
  const [onClose, setOnClose] = useState<() => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {

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
            {errors.map((error, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ElementPathBreadcrumbs item={error.path} />
                </ListItem>

                <ListItem>
                  <Typography>{error.message}</Typography>
                </ListItem>

              </React.Fragment>
            ))}
          </List>

          <DialogText value={`${errors.length} erreurs`} />

        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={close}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }, [errors, onClose]);

  return (errors: UiValidationError[]) => new Promise<void>(resolve => {
    setErrors(errors);
    setOnClose(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}