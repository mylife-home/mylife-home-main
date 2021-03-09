import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { useCanvasTheme } from '../drawing/theme';
import { Rectangle } from '../drawing/types';
import { computeComponentRect } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';
import { parseType } from '../../lib/member-types';
import { useRenameDialog } from '../../dialogs/rename';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponentIds, getComponent, getPlugin } from '../../../store/core-designer/selectors';
import { clearComponent } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-component' });

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { selection, select } = useSelection();
  const { componentIds, component, plugin, clear } = useConnect(selection.id);
  const componentCenterPosition = useCenterComponent(component, plugin);
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(componentIds, component.id, 'Entrer un nom de composant');

  const rename = (newId: string) => console.log('rename', component.id, newId);
  const duplicate = () => console.log('duplicate', component.id);
  
  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
      }
    });

  return (
    <div className={className}>
      <Group title={component.id}>
        <div className={classes.actions}>
          <CenterButton position={componentCenterPosition} />

          <Tooltip title="Dupliquer">
            <IconButton onClick={duplicate}>
              <FileCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Renommer">
            <IconButton onClick={onRename}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
        </div>

        <Item title="Instance">
          {plugin.instanceName}
        </Item>

        <Item title="Plugin">
          {`${plugin.module}.${plugin.name}`}
        </Item>
      </Group>

      <Group title="Membres" collapse>
        {plugin.stateIds.map((id => {
          const member = plugin.members[id];
          return (
            <Item key={id} title={id}>
              {member.description}
              {member.valueType}
            </Item>
          );
        }))}
      </Group>

      {!component.external && (
        <Group title="Configuration" collapse>
          {plugin.configIds.map((id => {
            const configItem = plugin.config[id];
            const configValue = component.config[id];

            return (
              <Item key={id} title={id}>
                {configItem.description}
                {configItem.valueType}
                {JSON.stringify(configValue)}
              </Item>
            );
          }))}
        </Group>
      )}

      <Group title="Bindings" collapse>
        TODO
      </Group>
    </div>
  );
};

export default Component;

function useConnect(componentId: string) {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  const componentIds = useSelector((state: AppState) => getComponentIds(state, tabId));

  const clear = useCallback(() => {
    dispatch(clearComponent({ id: tabId, componentId }));
  }, [tabId, dispatch, componentId]);

  return { componentIds, component, plugin, clear };
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
