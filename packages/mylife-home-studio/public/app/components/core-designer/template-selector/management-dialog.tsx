import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import { TransitionProps } from '../../dialogs/common';
import { useRenameDialog } from '../../dialogs/rename';
import { useTabPanelId, TabIdContext } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import DeleteButton from '../../lib/delete-button';
import { useFireAsync } from '../../lib/use-error-handling';
import { AppState } from '../../../store/types';

import { setTemplate, clearTemplate, renameTemplate } from '../../../store/core-designer/actions';
import { getTemplateIds, getTemplate, getTemplatesMap } from '../../../store/core-designer/selectors';

export type DialogResult = { status: 'ok' | 'cancel'; format?: string };

export function useManagementDialog() {
  const tabId = useTabPanelId();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    // bind modal to current tab
    return (
      <TabIdContext.Provider value={tabId}>
        <ManagementDialog open={open} hideModal={hideModal} onExited={onExited} />
      </TabIdContext.Provider>
    );
  }, [tabId]);

  return showModal;
}

const useStyles = makeStyles((theme) => ({
  dialog: {
  },
  content: {
  },
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    height: 200,
    width: 500,
  }
}), { name: 'template-management-dialog'});

interface ManagementDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
}

const ManagementDialog: FunctionComponent<ManagementDialogProps> = ({ open, hideModal, onExited }) => {
  const classes = useStyles();

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={hideModal} classes={{ paper: classes.dialog }} scroll='paper'>
      <DialogTitle id="dialog-title">
        Templates
        <NewTemplateButton />
      </DialogTitle>
    
      <DialogContent dividers classes={{ root: classes.content }}>
        <TemplateList />
      </DialogContent>
    
      <DialogActions>
        <Button onClick={hideModal}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

const NewTemplateButton: FunctionComponent = () => {
  const classes = useStyles();
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const makeNewId = useMakeNewId();
  
  const onNew = useCallback(() => {
    const templateId = makeNewId();
    dispatch(setTemplate({ tabId, templateId }));
  }, [tabId, dispatch, makeNewId]);

  return (
    <IconButton className={classes.newButton} onClick={onNew}>
      <AddIcon />
    </IconButton>
  );
};

const TemplateList: FunctionComponent = () => {
  const classes = useStyles();
  const templateIds = useTabSelector(getTemplateIds);

  return (
    <List disablePadding className={classes.list}>
      {templateIds.map(templateId => (
        <TemplateItem key={templateId} id={templateId} />
      ))}
    </List>
  );
};

const TemplateItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { template, onRename, onDelete } = useItemConnect(id);

  return (
    <ListItem>
      <ListItemText primary={template.templateId} />

        <ListItemSecondaryAction>
          <Tooltip title="Renommer">
            <IconButton onClick={onRename}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <DeleteButton icon tooltip="Supprimer" onConfirmed={onDelete} />
        </ListItemSecondaryAction>
    </ListItem>
  );
};

function useItemConnect(id: string) {
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const template = useSelector((state: AppState) => getTemplate(state, id));
  const templateIds = useTabSelector(getTemplateIds);
  const templatesMap = useSelector(getTemplatesMap);
  const templateNames = useMemo(() => templateIds.map(id => templatesMap[id].templateId), [templateIds, templatesMap]);
  const showRenameDialog = useRenameDialog(templateNames, template.templateId, 'Entrer le nouveau nom de template');

  const onRename = useCallback(() => {
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        dispatch(renameTemplate({ templateId: id, newId: newName }));
      }
    });
  }, [dispatch, fireAsync, showRenameDialog, id]);

  const onDelete = useCallback(() => {
    dispatch(clearTemplate({ templateId: id }));
  }, [dispatch, id]);

  return { template, onRename, onDelete };
}

function useMakeNewId() {
  const templateIds = useTabSelector(getTemplateIds);
  const templatesMap = useSelector(getTemplatesMap);
  
  return useCallback(() => {
    const set = new Set(templateIds.map(id => templatesMap[id].templateId));

    for (let i = 1; ; ++i) {
      const candidate = `new-${i}`;
      if (!set.has(candidate)) {
        return candidate;
      }
    }
  }, [templateIds]);
}
