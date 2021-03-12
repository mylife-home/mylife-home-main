import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import DeleteButton from '../../../lib/delete-button';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useFireAsync } from '../../../lib/use-error-handling';
import { StateIcon, ActionIcon } from '../../../lib/icons';
import { useCanvasTheme } from '../../drawing/theme';
import { Rectangle } from '../../drawing/types';
import { computeComponentRect } from '../../drawing/shapes';
import { useSelection } from '../../selection';
import CenterButton from '../center-button';
import { Group, Item } from '../../../lib/properties-layout';
import { useRenameDialog } from '../../../dialogs/rename';

import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { getComponentIds, getComponent, getPlugin, getBinding } from '../../../../store/core-designer/selectors';
import { clearComponent, renameComponent } from '../../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
  bindingLink: {
    display: 'flex',
  },
  multilineTitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  multilineTitleItem: {
    display: 'flex',
  },
  newButton: {
    alignSelf: 'flex-start',
    color: theme.palette.success.main,
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(-0.5),
  },
  memberIcon: {
    marginRight: theme.spacing(1),
  },
  memberSeparator: {
    width: '100%',
    height: theme.spacing(5),
  }
}), { name: 'properties-component' });

const Component: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { component, plugin } = useComponentData();

  return (
    <div className={className}>
      <Group title={component.id}>
        <Actions />

        <Item title="Instance">
          <Typography>{plugin.instanceName}</Typography>
        </Item>

        <Item title="Plugin" multiline>
          <Typography>{`${plugin.module}.${plugin.name}`}</Typography>
          <Typography color="textSecondary">{plugin.description}</Typography>
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
    <>
      <Item multiline noTitleTypography title={
        <div className={classes.multilineTitle}>
          <Typography className={classes.multilineTitleItem}>
            <MemberIcon className={classes.memberIcon}/>
            {name}
          </Typography>
          <Typography color="textSecondary">{member.description}</Typography>
        </div>
      }>
        <Typography>{member.valueType}</Typography>
        {bindings && bindings.map(id => 
          <MemberBinding key={id} id={id} memberType={member.memberType} />
        )}

        <Tooltip title="Nouveau binding">
          <IconButton className={classes.newButton} onClick={() => console.log('TODO new')}>
            <AddIcon />
          </IconButton>
        </Tooltip>

      </Item>

      <div className={classes.memberSeparator} />
    </>
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
      return ArrowForwardIcon;
    case types.MemberType.ACTION:
      return ArrowBackIcon;
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
