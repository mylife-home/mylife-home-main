import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import DeleteButton from '../../../lib/delete-button';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useCanvasTheme } from '../../drawing/theme';
import { Rectangle } from '../../drawing/types';
import { computeComponentRect } from '../../drawing/shapes';
import { useSelection } from '../../selection';
import CenterButton from '../center-button';
import { useRenameDialog } from '../../../dialogs/rename';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponentIds, getComponent, getPlugin } from '../../../../store/core-designer/selectors';
import { clearComponent, renameComponent } from '../../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-component-actions' });

const Actions: FunctionComponent = () => {
  const classes = useStyles();
  const { componentIds, component, plugin, clear, rename } = useActionsConnect();
  const componentCenterPosition = useCenterComponent(component, plugin);
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(componentIds, component.id, 'Entrer un nom de composant');
  
  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
      }
    });

  return (
    <div className={classes.container}>
      <CenterButton position={componentCenterPosition} />

      <Tooltip title="Renommer">
        <IconButton onClick={onRename}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
    </div>
  );
};

export default Actions;

function useActionsConnect() {
  const tabId = useTabPanelId();
  const { selectedComponent: componentId } = useSelection();
  const dispatch = useDispatch();

  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  const componentIds = useSelector((state: AppState) => getComponentIds(state, tabId));

  const { clear, rename } = useMemo(() => ({
    clear: () => {
      dispatch(clearComponent({ id: tabId, componentId }));
    },
    rename: (newId: string) => {
      dispatch(renameComponent({ id: tabId, componentId, newId }));
    },
  }), [tabId, dispatch, componentId]);

  return { componentIds, component, plugin, clear, rename };
}

function useCenterComponent(component: types.Component, plugin: types.Plugin) {
  const theme = useCanvasTheme();
  return useMemo(() => {
    const rect = computeComponentRect(theme, component, plugin);
    return computeCenter(rect);
  }, [theme, component]);
}

function computeCenter(rect: Rectangle) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}
