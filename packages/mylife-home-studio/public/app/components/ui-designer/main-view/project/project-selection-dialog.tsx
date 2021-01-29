import React, { FunctionComponent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { TransitionProps, DialogText } from '../../../dialogs/common';
import { AppState } from '../../../../store/types';
import { getCoreProjectsIds, getCoreProjectInfo } from '../../../../store/projects-list/selectors';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export function useProjectSelectionDialog() {
  const classes = useStyles();
  const [onResult, setOnResult] = useState<(projectId: string) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const ids = useSelector(getCoreProjectsIds);

      const close = () => {
        hideModal();
        onResult(null);
      };

      const createSelect = (projectId: string) => () => {
        hideModal();
        onResult(projectId);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            close();
            break;
        }
      };

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Selection de projet</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Sélectionner un projet à partir duquel importer les composants'} />

            <List className={classes.list}>
              {ids.map((id) => (
                <ProjectItem key={id} id={id} onSelect={createSelect(id)} />
              ))}
            </List>
          </DialogContent>
        </Dialog>
      );
    },
    [onResult]
  );

  return useCallback(
    () =>
      new Promise<string>((resolve) => {
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setOnResult, showModal]
  );
}

export const ProjectItem: FunctionComponent<{ id: string; onSelect: () => void }> = ({ id, onSelect }) => {
  const info = useSelector((state: AppState) => getCoreProjectInfo(state, id));

  return (
    <ListItem button onClick={onSelect}>
      <ListItemText primary={id} secondary={'TODO'} />
    </ListItem>
  );
};
