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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import { TransitionProps, DialogText } from '../../dialogs/common';
import { AppState } from '../../../store/types';
import { getCoreProjectsIds, getCoreProjectInfo } from '../../../store/projects-list/selectors';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export function useImportFromProjectSelectionDialog() {
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
            <DialogText value={'Sélectionner un projet à partir duquel importer'} />

            <List className={classes.list}>
              {ids.map((id) => (
                <ProjectItem key={id} id={id} onSelect={createSelect(id)} />
              ))}
            </List>

            <DialogText value={'Sélectionner les éléments à importer'} />
            <FormControlLabel control={<Checkbox />} label="Importer les plugins" />
            <FormControlLabel control={<Checkbox />} label="Importer les composants" />
            <RadioGroup>
              <FormControlLabel control={<Radio />} label="Comme externes (ex: depuis un projet de composants drivers)" />
              <FormControlLabel control={<Radio />} label="Comme normaux (ex: pour fusionner 2 projets)" />
            </RadioGroup>
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

const ProjectItem: FunctionComponent<{ id: string; onSelect: () => void }> = ({ id, onSelect }) => {
  const info = useSelector((state: AppState) => getCoreProjectInfo(state, id));

  return (
    <ListItem button onClick={onSelect}>
      <ListItemText primary={id} secondary={'TODO'} />
    </ListItem>
  );
};
