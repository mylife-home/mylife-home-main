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
import { newWindow, cloneWindow, clearWindow, renameWindow } from '../../../../store/ui-designer/actions';
import { getWindowsIds, getWindow, getWindowsMap, makeGetWindowUsage } from '../../../../store/ui-designer/selectors';
import { useRemoveUsageConfirmDialog } from './remove-usage-confirm-dialog';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
}));

export const WindowsActions: FunctionComponent = () => {
  const classes = useStyles();
  const { newWindow } = useWindowsConnect();
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onNew = () =>
    fireAsync(async () => {
      const { status, id } = await showNewNameDialog();
      if (status === 'ok') {
        newWindow(id);
      }
    });

  return (
    <Tooltip title="Nouvelle fenêtre">
      <IconButton className={classes.newButton} onClick={onNew}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  );
};

export const WindowActions: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { duplicate, rename, remove, usage, window } = useWindowConnect(id);
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
      const { status, id: newId } = await showNewNameDialog(window.windowId);
      if (status === 'ok') {
        rename(newId);
      }
    });

  const onRemoveWithUsage = () =>
    fireAsync(async () => {
      const { status } = await showRemoveUsageConfirmDialog({ 
        title: 'Supprimer la fenêtre',
        message: 'La fenêtre est utilisée :',
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

function useWindowsConnect() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return {
    newWindow: useCallback(
      (newId: string) => {
        dispatch(newWindow({ tabId, newId }));
      },
      [dispatch, tabId]
    )
  };
}

function useWindowConnect(id: string) {
  const tabId = useTabPanelId();
  const getWindowUsage = useMemo(() => makeGetWindowUsage(), []);
  const window = useSelector((state: AppState) => getWindow(state, id));
  const usage = useSelector((state: AppState) => getWindowUsage(state, tabId, id));
  const dispatch = useDispatch();

  const callbacks = useMemo(
    () => ({
      duplicate: (newId: string) => {
        dispatch(cloneWindow({ windowId: id, newId }));
      },
      rename: (newId: string) => {
        dispatch(renameWindow({ windowId: id, newId }));
      },
      remove: () => {
        dispatch(clearWindow({ windowId: id }));
      },
    }),
    [dispatch, id]
  );

  return { ...callbacks, usage, window };
}

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const windowsIds = useTabSelector(getWindowsIds);
  const windowsMap = useSelector(getWindowsMap);
  const windowsNames = useMemo(() => windowsIds.map(id => windowsMap[id].windowId), [windowsIds, windowsMap]);

  return async (initialId: string = null) => {
    const options = {
      title: 'Nouveau nom',
      message: 'Entrer un nom de fenêtre',
      initialText: initialId || 'Nouvelle fenêtre',
      validator(newId: string) {
        if (!newId) {
          return 'Nom vide';
        }
        if (newId === initialId) {
          return;
        }
        if (windowsNames.includes(newId)) {
          return 'Ce nom existe déjà';
        }
      },
    };

    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}
