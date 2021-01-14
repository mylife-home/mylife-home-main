import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useTabPanelId } from '../../../lib/tab-panel';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useFireAsync } from '../../../lib/use-error-handling';
import { clone } from '../../../lib/clone';
import { useInputDialog } from '../../../dialogs/input';
import { AppState } from '../../../../store/types';
import { setWindow, clearWindow, renameWindow } from '../../../../store/ui-designer/actions';
import { getWindowsIds, getWindow } from '../../../../store/ui-designer/selectors';
import { createNewWindow } from './templates';

export function useWindowsActions() {
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

  return { onNew };
}

export function useWindowActions(id: string) {
  const { duplicate, rename, remove } = useWindowConnect(id);
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onDuplicate = () =>
    fireAsync(async () => {
      const { status, id: newId } = await showNewNameDialog();
      if (status === 'ok') {
        duplicate(newId);
      }
    });

  const onRename = () =>
    fireAsync(async () => {
      const { status, id: newId } = await showNewNameDialog(id);
      if (status === 'ok') {
        rename(newId);
      }
    });

  const onRemove = remove;

  return { onDuplicate, onRename, onRemove };
}

function useWindowsConnect() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const newWindow = useCallback((id: string) => {
    const newWindow = createNewWindow();
    newWindow.id = id;
    dispatch(setWindow({ id: tabId, window: newWindow }));
  }, [dispatch, tabId]);

  return { newWindow };
}

function useWindowConnect(id: string) {
  const tabId = useTabPanelId();
  const window = useSelector((state: AppState) => getWindow(state, tabId, id));
  const dispatch = useDispatch();

  return useMemo(() => ({
    duplicate: (newId: string) => {
      const newWindow = clone(window);
      newWindow.id = newId;
      dispatch(setWindow({ id: tabId, window: newWindow }));
    },
    rename: (newId: string) => {
      dispatch(renameWindow({ id: tabId, windowId: id, newId }));
    },
    remove: () => {
      dispatch(clearWindow({ id: tabId, windowId: id }));
    },
  }), [dispatch, tabId, id]);
}

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const windowsIds = useTabSelector(getWindowsIds);

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
        if (windowsIds.includes(newId)) {
          return 'Ce nom existe déjà';
        }
      }
    };

    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}
