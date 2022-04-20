import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

import DeleteButton from '../../../lib/delete-button';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync, useReportError } from '../../../lib/use-error-handling';
import { useCanvasTheme } from '../../drawing/theme';
import { computeCenter, computeComponentRect } from '../../drawing/shapes';
import CenterButton from '../center-button';
import CopyToTemplateButton from '../copy-to-template';
import { useRenameDialog } from '../../../dialogs/rename';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponentIds, getComponentsMap, getComponent, getSelectedComponent, makeGetExportedComponentIds, makeGetComponentDefinitionProperties } from '../../../../store/core-designer/selectors';
import { clearComponents, renameComponent } from '../../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-component-actions' });

const Actions: FunctionComponent = () => {
  const classes = useStyles();
  const { componentIds, component, definition, clear, rename } = useActionsConnect();
  const componentCenterPosition = useCenterComponent(component, definition);
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(componentIds, component.componentId, 'Entrer un nom de composant');
  const copyComponentsIds = useMemo(() => ([component.id]), [component.id]);
  
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
      <CopyToTemplateButton componentsIds={copyComponentsIds} />

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
  const componentId = useSelector(useCallback((state: AppState) => getSelectedComponent(state, tabId), [tabId]));
  const dispatch = useDispatch();

  const component = useSelector(useCallback((state: AppState) => getComponent(state, componentId), [componentId]));
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const definition = useSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));
  const componentFullIds = useSelector(useCallback((state: AppState) => getComponentIds(state, tabId), [tabId]));
  const componentsMap = useSelector(getComponentsMap);
  const componentIds = useMemo(() => componentFullIds.map(id => componentsMap[id].componentId), [componentFullIds, componentsMap]);
  const getExportedComponentIds = useMemo(() => makeGetExportedComponentIds(), []);
  const exportedComponentIds = useTabSelector(getExportedComponentIds);
  const onError = useReportError();


  const { clear, rename } = useMemo(() => ({
    clear: () => {
      if (exportedComponentIds.includes(componentId)) {
        const err = new Error('Le composant est exporté et ne peut pas être supprimé.');
        onError(err);
      } else {
        dispatch(clearComponents({ componentsIds: [componentId] }));
      }
    },
    rename: (newId: string) => {
      dispatch(renameComponent({ componentId, newId }));
    },
  }), [tabId, dispatch, componentId, exportedComponentIds, onError]);

  return { componentIds, component, definition, clear, rename };
}

function useCenterComponent(component: types.Component, definition: types.ComponentDefinitionProperties) {
  const theme = useCanvasTheme();
  return useMemo(() => {
    const rect = computeComponentRect(theme, component, definition);
    return computeCenter(rect);
  }, [theme, component]);
}
