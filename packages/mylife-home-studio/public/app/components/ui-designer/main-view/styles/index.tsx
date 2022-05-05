import React, { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import DeleteButton from '../../../lib/delete-button';
import { Container, Title } from '../../../lib/main-view-layout';
import { StyleIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useRenameDialog } from '../../../dialogs/rename';
import { useInputDialog } from '../../../dialogs/input';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useTabPanelId } from '../../../lib/tab-panel';
import { AppState } from '../../../../store/types';
import { getStylesIds, getStyle, getStylesMap, makeGetStyleUsage } from '../../../../store/ui-designer/selectors';
import { setStyle, clearStyle, renameStyle } from '../../../../store/ui-designer/actions';
import { UiStyle } from '../../../../store/ui-designer/types';
import { useRemoveUsageConfirmDialog } from '../common/remove-usage-confirm-dialog';
import Display from './display';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'row',
  },
  list: {
    width: 500,
    overflowY: 'auto',
  },
  display: {
    flex: 1,
  },
}));

const Styles: FunctionComponent = () => {
  const classes = useStyles();
  const fireAsync = useFireAsync();
  const { setStyle } = useStylesActions();
  const stylesIds = useTabSelector(getStylesIds);
  const [selection, select] = useSelection();
  const showNewNameDialog = useNewNameDialog();

  const onNew = () =>
    fireAsync(async () => {
      const { status, id } = await showNewNameDialog();
      if (status === 'ok') {
        setStyle({ id: null, styleId: id, properties: {} });
      }
    });

  return (
    <Container
      title={
        <>
          <Title text="Styles" icon={StyleIcon} />

          <Tooltip title="Nouveau style">
            <IconButton className={classes.newButton} onClick={onNew}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {stylesIds.map((id) => (
          <StyleItem key={id} id={id} selected={selection === id} onSelect={() => select(id)} />
        ))}
      </List>

      <Divider orientation="vertical" />
      
      {selection && (
        <Display className={classes.display} id={selection} />
      )}
    </Container>
  );
};

export default Styles;

const StyleItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void; }> = ({ id, selected, onSelect }) => {
  const classes = useStyles();
  const getStyleUsage = useMemo(() => makeGetStyleUsage(), []);
  const styles = useTabSelector(getStylesIds);
  const style = useSelector((state: AppState) => getStyle(state, id));
  const usage = useTabSelector((state, tabId) => getStyleUsage(state, tabId, id));
  const { renameStyle, clearStyle } = useStylesActions();
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(styles, style.styleId, 'Entrer le nouveau nom de style');
  const showRemoveUsageConfirmDialog = useRemoveUsageConfirmDialog();

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        renameStyle(style.id, newName);
      }
    });
    
  const onRemoveWithUsage = () =>
    fireAsync(async () => {
      const { status } = await showRemoveUsageConfirmDialog({ 
        title: 'Supprimer le style',
        message: 'Le style est utilisé :',
        usage
      });
      
      if (status === 'ok') {
        clearStyle(style.id);
      }
    });

  const onRemove = () => {
    clearStyle(style.id);
  };

  return (
    <ListItem button selected={selected} onClick={onSelect}>
      <ListItemIcon>
        <StyleIcon />
      </ListItemIcon>

      <ListItemText primary={style.styleId} />

      <ListItemSecondaryAction>
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
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useStylesActions() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return useMemo(() => ({
    setStyle: (style: UiStyle) => dispatch(setStyle({ tabId, style })),
    clearStyle: (styleId: string) => dispatch(clearStyle({ styleId })),
    renameStyle: (styleId: string, newId: string) => dispatch(renameStyle({ styleId, newId })),
  }), [dispatch, tabId]);
}

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const stylesIds = useTabSelector(getStylesIds);
  const stylesMap = useSelector(getStylesMap);
  const stylesNames = useMemo(() => stylesIds.map(id => stylesMap[id].styleId), [stylesIds, stylesMap]);

  return async (initialId: string = null) => {
    const options = {
      title: 'Nouveau nom',
      message: 'Entrer un nom de style',
      initialText: initialId || 'Nouveau style',
      validator(newId: string) {
        if (!newId) {
          return 'Nom vide';
        }
        if (newId === initialId) {
          return;
        }
        if (stylesNames.includes(newId)) {
          return 'Ce nom existe déjà';
        }
      },
    };

    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}

function useSelection(): [string, (id: string) => void] {
  const ids = useTabSelector(getStylesIds);
  const [selection, select] = useState<string>(null);
  const idSet = useMemo(() => new Set(ids), [ids]);

  // auto-reset selection to null if id does not exist anymore (deleted/renamed)
  useEffect(() => {
    if (selection && !idSet.has(selection)) {
      select(null);
    }
  }, [selection, idSet]);

  const finalSelection = idSet.has(selection) ? selection : null;

  return [finalSelection, select];
}
