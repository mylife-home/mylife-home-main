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
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import { TransitionProps, DialogText } from '../../dialogs/common';
import { AppState } from '../../../store/types';
import { getCoreProjectsIds, getCoreProjectInfo } from '../../../store/projects-list/selectors';
import { ImportFromProjectConfig } from '../../../store/core-designer/types';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  spacer: {
    height: theme.spacing(8),
  },
  componentsOptions: {
    paddingLeft: theme.spacing(4)
  }
}));

export function useImportFromProjectSelectionDialog() {
  const classes = useStyles();
  const [onResult, setOnResult] = useState<(projectId: string, ) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const ids = useSelector(getCoreProjectsIds);
      const [projectId, selectProjectId] = useState<string>(null);

      const close = () => {
        hideModal();
        onResult(null);
      };

      const createSelect = (projectId: string) => () => {
        selectProjectId(projectId);
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
          <DialogTitle id="dialog-title">Sélection de projet</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Sélectionner un projet à partir duquel importer'} />

            <List className={classes.list}>
              {ids.map((id) => (
                <ProjectItem key={id} id={id} onSelect={createSelect(id)} selected={id === projectId} />
              ))}
            </List>

            <div className={classes.spacer} />

            <DialogText value={'Sélectionner les éléments à importer'} />
            <FormGroup>
              <FormControlLabel control={<Checkbox color='primary' />} label="Importer les plugins" />
              <FormControlLabel control={<Checkbox color='primary' />} label="Importer les composants" />

              <RadioGroup className={classes.componentsOptions}>
                <FormControlLabel disabled control={<Radio color='primary' />} label="Comme externes (ex: depuis un projet de composants drivers)" />
                <FormControlLabel disabled control={<Radio color='primary' />} label="Comme normaux (ex: pour fusionner 2 projets)" />
              </RadioGroup>
            </FormGroup>
          </DialogContent>
        </Dialog>
      );
    },
    [onResult]
  );

  return useCallback(
    () =>
      new Promise<ImportFromProjectConfig>((resolve) => {
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setOnResult, showModal]
  );
}

const ProjectItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void }> = ({ id, selected, onSelect }) => {
  const info = useSelector((state: AppState) => getCoreProjectInfo(state, id));

  return (
    <ListItem button onClick={onSelect} selected={selected}>
      <ListItemText primary={id} secondary={'TODO'} />
    </ListItem>
  );
};
