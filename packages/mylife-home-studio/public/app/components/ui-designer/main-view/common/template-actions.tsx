import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/Delete';

import DeleteButton from '../../../lib/delete-button';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useInputDialog } from '../../../dialogs/input';
import { AppState } from '../../../../store/types';
import { newTemplate, cloneTemplate, clearTemplate, renameTemplate } from '../../../../store/ui-designer/actions';
import { getTemplatesIds, getTemplate, getTemplatesMap, makeGetTemplateUsage } from '../../../../store/ui-designer/selectors';
import { useRemoveUsageConfirmDialog } from './remove-usage-confirm-dialog';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
}));

export const TemplatesActions: FunctionComponent = () => {
  const classes = useStyles();
  const { newTemplate } = useTemplatesConnect();
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onNew = () =>
    fireAsync(async () => {
      const { status, id } = await showNewNameDialog();
      if (status === 'ok') {
        newTemplate(id);
      }
    });

  return (
    <Tooltip title="Nouveau template">
      <IconButton className={classes.newButton} onClick={onNew}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
};

export const TemplateActions: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { duplicate, rename, remove, usage, template } = useTemplateConnect(id);
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();
  const showRemoveUsageConfirmDialog = useRemoveUsageConfirmDialog();

  const onDuplicate = () =>
    fireAsync(async () => {
      const { status, id: newId } = await showNewNameDialog();
      if (status === 'ok') {
        duplicate(newId);
      }
    });

  const onRename = () =>
    fireAsync(async () => {
      const { status, id: newId } = await showNewNameDialog(template.templateId);
      if (status === 'ok') {
        rename(newId);
      }
    });

  const onRemoveWithUsage = () =>
    fireAsync(async () => {
      const { status } = await showRemoveUsageConfirmDialog({ 
        title: 'Supprimer le template',
        message: 'Le template est utilisé :',
        usage
      });
      
      if (status === 'ok') {
        remove();
      }
    });

  const onRemove = remove;

  return (
    <>
      <Tooltip title="Dupliquer">
        <IconButton onClick={onDuplicate}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Renommer">
        <IconButton onClick={onRename}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      {usage.length === 0 ? (
        <DeleteButton icon tooltip="Supprimer" onConfirmed={onRemove} />
      ) : (
        <Tooltip title="Supprimer">
          <IconButton className={classes.deleteButton} onClick={onRemoveWithUsage}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

function useTemplatesConnect() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return {
    newTemplate: useCallback(
      (newId: string) => {
        dispatch(newTemplate({ tabId, newId }));
      },
      [dispatch, tabId]
    )
  };
}

function useTemplateConnect(id: string) {
  const tabId = useTabPanelId();
  const getTemplateUsage = useMemo(() => makeGetTemplateUsage(), []);
  const template = useSelector((state: AppState) => getTemplate(state, id));
  const usage = useSelector((state: AppState) => getTemplateUsage(state, tabId, id));
  const dispatch = useDispatch();

  const callbacks = useMemo(
    () => ({
      duplicate: (newId: string) => {
        dispatch(cloneTemplate({ templateId: id, newId }));
      },
      rename: (newId: string) => {
        dispatch(renameTemplate({ templateId: id, newId }));
      },
      remove: () => {
        dispatch(clearTemplate({ templateId: id }));
      },
    }),
    [dispatch, id]
  );

  return { ...callbacks, usage, template };
}

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const templatesIds = useTabSelector(getTemplatesIds);
  const templatesMap = useSelector(getTemplatesMap);
  const templatesNames = useMemo(() => templatesIds.map(id => templatesMap[id].templateId), [templatesIds, templatesMap]);

  return async (initialId: string = null) => {
    const options = {
      title: 'Nouveau nom',
      message: 'Entrer un nom de template',
      initialText: initialId || 'Nouveau template',
      validator(newId: string) {
        if (!newId) {
          return 'Nom vide';
        }
        if (newId === initialId) {
          return;
        }
        if (templatesNames.includes(newId)) {
          return 'Ce nom existe déjà';
        }
      },
    };

    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}
