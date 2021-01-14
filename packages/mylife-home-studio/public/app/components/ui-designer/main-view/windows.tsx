import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Container, Title } from '../../lib/main-view-layout';
import { WindowIcon } from '../../lib/icons';
import { useTabPanelId } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useFireAsync } from '../../lib/use-error-handling';
import DeleteButton from '../../lib/delete-button';
import { clone } from '../../lib/clone';
import { useInputDialog } from '../../dialogs/input';
import { AppState } from '../../../store/types';
import { setWindow, clearWindow, renameWindow } from '../../../store/ui-designer/actions';
import { getWindowsIds, getWindow } from '../../../store/ui-designer/selectors';
import { createNewWindow } from './common/templates';
import { useSelection } from '../selection';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    width: 900,
  },
}));

const Windows: FunctionComponent = () => {
  const classes = useStyles();
  const { windowsIds, newWindow } = useWindowsConnect();
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
    <Container
      title={
        <>
          <Title text="Windows" icon={WindowIcon} />

          <Tooltip title="Nouvelle fenêtre">
            <IconButton className={classes.newButton} onClick={onNew}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {windowsIds.map((id) => (
          <WindowItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

export default Windows;

const WindowItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
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

  return (
    <ListItem button onClick={() => select({ type: 'window', id })}>
      <ListItemIcon>
        <WindowIcon />
      </ListItemIcon>

      <ListItemText primary={id} />

      <ListItemSecondaryAction>
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

        <DeleteButton icon tooltip="Supprimer" onConfirmed={remove} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useWindowsConnect() {
  const tabId = useTabPanelId();
  const windowsIds = useSelector((state: AppState) => getWindowsIds(state, tabId));
  const dispatch = useDispatch();

  const newWindow = useCallback((id: string) => {
    const newWindow = createNewWindow();
    newWindow.id = id;
    dispatch(setWindow({ id: tabId, window: newWindow }));
  }, [dispatch, tabId]);

  return { windowsIds, newWindow };
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
