import React, { FunctionComponent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
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
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText } from '../../dialogs/common';
import { AppState } from '../../../store/types';
import { getCoreProjectsIds, getCoreProjectInfo } from '../../../store/projects-list/selectors';
import { ImportConfig, ImportFromProjectConfig } from '../../../store/core-designer/types';

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

const DEFAULT_CONFIG: ImportFromProjectConfig = { projectId: null, importPlugins: false, importComponents: null };

type ImportFromOnlineDialogResult = ConfirmResult & { config?: ImportConfig };
type ImportFromProjectDialogResult = ConfirmResult & { config?: ImportFromProjectConfig };

export function useImportFromOnlineSelectionDialog() {
  const showDialog = useImportSelectionDialog(false);

  return useCallback(async () => {
    const result = await showDialog();
    return convertResult(result);
  }, [showDialog]);
}

function convertResult(result: ImportFromProjectDialogResult): ImportFromOnlineDialogResult {
  if (result.status !== 'ok') {
    return result;
  }

  // drop projectId
  const { projectId, ...config } = result.config;
  return { status: 'ok', config };
}

export function useImportFromProjectSelectionDialog() {
  return useImportSelectionDialog(true);
}

export function useImportSelectionDialog(showProjectSelection: boolean) {
  const classes = useStyles();
  const [onResult, setOnResult] = useState<(result: ImportFromProjectDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const ids = useSelector(getCoreProjectsIds);
      const [config, updateConfig] = useState(DEFAULT_CONFIG);

      const close = () => {
        hideModal();
        onResult(null);
      };

      const createSelectHandler = (projectId: string) => () => {
        updateConfig(config => ({ ...config, projectId }));
      };

      const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const importComponents = (event.target as HTMLInputElement).value as ImportFromProjectConfig['importComponents'];
        updateConfig(config => ({ ...config, importComponents }));
      }

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };
  
      const validate = () => {
        if (isConfigValid(config, showProjectSelection)) {
          hideModal();
          onResult({ status: 'ok', config });
        }
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
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="sm" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Sélection de projet</DialogTitle>

          <DialogContent dividers>
            {showProjectSelection && (
              <>
                <DialogText value={'Sélectionner un projet à partir duquel importer'} />

                <List className={classes.list}>
                  {ids.map((id) => (
                    <ProjectItem key={id} id={id} onSelect={createSelectHandler(id)} selected={config.projectId === id} />
                  ))}
                </List>

                <div className={classes.spacer} />
              </>
            )}

            <DialogText value={'Sélectionner les éléments à importer'} />
            <FormGroup>
              <CheckBoxWithLabel label="Importer les plugins" value={config.importPlugins} onChange={importPlugins => updateConfig(config => ({ ...config, importPlugins}))} />
              <CheckBoxWithLabel label="Importer les composants" value={!!config.importComponents} onChange={value => updateConfig(config => ({ ...config, importComponents: (value ? 'external' : null)}))} />

              <RadioGroup className={classes.componentsOptions} value={config.importComponents} onChange={handleRadioChange}>
                <FormControlLabel disabled={!config.importComponents} value={'external'} control={<Radio color='primary' />} label="Comme externes (ex: depuis un projet de composants drivers)" />
                <FormControlLabel disabled={!config.importComponents} value={'standard'} control={<Radio color='primary' />} label="Comme normaux (ex: pour fusionner 2 projets)" />
              </RadioGroup>
            </FormGroup>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={validate} disabled={!isConfigValid(config, showProjectSelection)}>OK</Button>
            <Button onClick={cancel}>Annuler</Button>
          </DialogActions>
        </Dialog>
      );
    },
    [onResult, showProjectSelection]
  );

  return useCallback(
    () =>
      new Promise<ImportFromProjectDialogResult>((resolve) => {
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setOnResult, showModal]
  );
}

const CheckBoxWithLabel: FunctionComponent<{ label: string; value: boolean; onChange: (newValue: boolean) => void }> = ({ label, value, onChange }) => (
  <FormControlLabel label={label} control={<Checkbox color='primary' checked={value} onChange={e => onChange(e.target.checked)} />} />
);

const ProjectItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void }> = ({ id, selected, onSelect }) => {
  const info = useSelector((state: AppState) => getCoreProjectInfo(state, id));

  return (
    <ListItem button onClick={onSelect} selected={selected}>
      <ListItemText primary={id} secondary={'TODO'} />
    </ListItem>
  );
};

function isConfigValid(config: ImportFromProjectConfig, showProjectSelection: boolean) {
  return (!showProjectSelection || config.projectId) && (config.importComponents || config.importPlugins);
}