import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useFireAsync } from '../../lib/use-error-handling';
import { StateIcon, ActionIcon } from '../../lib/icons';
import { useCanvasTheme } from '../drawing/theme';
import { Rectangle } from '../drawing/types';
import { computeComponentRect } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';
import { useRenameDialog } from '../../dialogs/rename';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponentIds, getComponent, getPlugin, getBinding } from '../../../store/core-designer/selectors';
import { clearComponent } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
  multiLine: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  bindingLink: {
    display: 'flex',
  },
  newButton: {
    color: theme.palette.success.main,
  },
  memberIcon: {
    marginRight: theme.spacing(1),
  },
}), { name: 'properties-component' });

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { component, plugin } = useComponentData();

  return (
    <div className={className}>
      <Group title={component.id}>
        <Actions />

        <Item title="Instance">
          {plugin.instanceName}
        </Item>

        <Item title="Plugin">
          {`${plugin.module}.${plugin.name}`}
        </Item>
      </Group>

      <Configuration />
      <Members />
    </div>
  );
};

export default Component;

const Actions: FunctionComponent = () => {
  const classes = useStyles();
  const { componentIds, component, plugin, clear } = useActionsConnect();
  const componentCenterPosition = useCenterComponent(component, plugin);
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(componentIds, component.id, 'Entrer un nom de composant');

  const rename = (newId: string) => console.log('rename', component.id, newId);
  
  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
      }
    });

  return (
    <div className={classes.actions}>
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

const Configuration: FunctionComponent = () => {
  const { component, plugin } = useComponentData();

  if(component.external) {
    return null;
  }

  return (
    <Group title="Configuration" collapse>
      {plugin.configIds.map((id => {
        const configItem = plugin.config[id];
        const configValue = component.config[id];

        return (
          <Item key={id} title={id}>
            {configItem.description}
            {configItem.valueType}
            {JSON.stringify(configValue)}
            TODO
          </Item>
        );
      }))}
    </Group>
  );
};

const Members: FunctionComponent = () => {
  const { plugin } = useComponentData();

  return (
    <Group title="Membres" collapse>
      {plugin.stateIds.map(id => 
        <Member key={id} name={id} />
      )}

      {plugin.actionIds.map(id => 
        <Member key={id} name={id} />
      )}
    </Group>
  );
};

const Member: FunctionComponent<{ name: string }> = ({ name }) => {
  const classes = useStyles();
  const { component, plugin } = useComponentData();
  const member = plugin.members[name];
  const bindings = component.bindings[name];
  const MemberIcon = getMemberIcon(member.memberType);
  
  return (
    <Item title={
      <>
        <MemberIcon className={classes.memberIcon}/>
        {name}
      </>
    }>
      <div className={classes.multiLine}>
        <Typography>{member.description}</Typography>
        <Typography>{member.valueType}</Typography>
        {bindings && bindings.map(id => 
          <MemberBinding key={id} id={id} memberType={member.memberType} />
        )}
        <div>
        <Tooltip title="Nouveau binding">
          <IconButton className={classes.newButton} onClick={() => console.log('TODO new')}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        </div>
      </div>
    </Item>
  );
};

function getMemberIcon(memberType: types.MemberType) {
  switch(memberType) {
    case types.MemberType.STATE:
      return StateIcon;
    case types.MemberType.ACTION:
      return ActionIcon;
  }
}

const MemberBinding: FunctionComponent<{ id: string; memberType: types.MemberType }> = ({ id, memberType }) => {
  const classes = useStyles();
  const { select } = useSelection();
  const BindingIcon = getBindingIcon(memberType);
  const binding = useTabSelector((state, tabId) => getBinding(state, tabId, id));
  const handleSelect = () => select({ type: 'binding', id: binding.id });

  return (
    <Link variant="body1" color="textPrimary" href="#" className={classes.bindingLink} onClick={handleSelect}>
      <BindingIcon />
      {getBindingDisplay(binding, memberType)}
    </Link>
  );
};

function getBindingIcon(memberType: types.MemberType) {
  switch (memberType) {
    case types.MemberType.STATE:
      return ChevronRightIcon;
    case types.MemberType.ACTION:
      return ChevronLeftIcon;
  }
}

function getBindingDisplay(binding: types.Binding, memberType: types.MemberType) {
  switch (memberType) {
    case types.MemberType.STATE:
      return `${binding.targetComponent}.${binding.targetAction}`;
    case types.MemberType.ACTION:
      return `${binding.sourceComponent}.${binding.sourceState}`;
  }
}

function useActionsConnect() {
  const tabId = useTabPanelId();
  const { selection } = useSelection();
  const dispatch = useDispatch();

  const componentId = selection.id;
  const component = useSelector((state: AppState) => getComponent(state, tabId, componentId));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  const componentIds = useSelector((state: AppState) => getComponentIds(state, tabId));

  const clear = useCallback(() => {
    dispatch(clearComponent({ id: tabId, componentId }));
  }, [tabId, dispatch, componentId]);

  return { componentIds, component, plugin, clear };
}

function useComponentData() {
  const tabId = useTabPanelId();
  const { selection } = useSelection();
  const component = useSelector((state: AppState) => getComponent(state, tabId, selection.id));
  const plugin = useSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  return { component, plugin };
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
