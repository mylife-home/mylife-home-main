import React, { FunctionComponent, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles, fade } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { ComponentIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { Deferred } from '../../lib/deferred';
import { useCreatable } from '../component-creation-dnd';
import { AppState } from '../../../store/types';
import { Plugin, CoreToolboxDisplay, Position, ComponentDefinition } from '../../../store/core-designer/types';
import { getInstanceIds, getInstance, getPlugin, getComponentIds, getComponentsMap, getActiveTemplateId, getInstanceStats, getPluginStats, getTemplate, getTemplateStats, getUsableTemplates } from '../../../store/core-designer/selectors';
import { setComponent } from '../../../store/core-designer/actions';
import { InstanceMenuButton, PluginMenuButton, TemplateMenuButton } from './menus';
import { useSelectComponent } from '../selection';

const useStyles = makeStyles((theme) => ({
  list: {
    overflowY: 'auto',
  },
  dragSource: {
    color: theme.palette.success.main,
    cursor: 'copy',
    margin: theme.spacing(-3), // balance ripple padding
  },
  indent1: {
    paddingLeft: theme.spacing(8),
  },
  indent2: {
    paddingLeft: theme.spacing(16),
  },
  unused: {
    opacity: 0.6,
  },
  external: {
    backgroundColor: fade(orange[300], 0.1),
  },
}));

const Toolbox: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const instances = useTabSelector(getInstanceIds);

  return (
    <List className={clsx(className, classes.list)}>
      <Templates />

      {instances.map((id) => (
        <Instance key={id} id={id} display="show" />
      ))}

      <Hidden>
        {instances.map((id) => (
          <Instance key={id} id={id} display="hide" />
        ))}
      </Hidden>
    </List>
  );
};

export default Toolbox;

const Hidden: FunctionComponent = ({ children }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText primary="Cachés" />
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

const Templates: FunctionComponent = () => {
  const [open, setOpen] = useState(true);
  const ids = useTabSelector(getUsableTemplates);

  const handleClick = () => {
    setOpen(!open);
  };

  if (!ids.length) {
    // No template
    return null;
  }

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>

        <ListItemText primary='Templates' />
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {ids.map((id) => (
            <Template key={id} id={id} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const Template: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const template = useSelector(useCallback((state: AppState) => getTemplate(state, id), [id]));
  const definition: ComponentDefinition = useMemo(() => ({ type: 'template', id }), [id]);
  const stats = useSelector(useCallback((state: AppState) => getTemplateStats(state, id), [id]));

  return (
    <ListItem className={clsx(classes.indent1, stats.use === 'unused' && classes.unused)}>
      <ListItemIcon>
        <DragButton definition={definition} />
      </ListItemIcon>

      <ListItemText primary={template.templateId} />

      <ListItemSecondaryAction>
        <TemplateMenuButton id={template.id} />
      </ListItemSecondaryAction>
    </ListItem>
  );

}

const Instance: FunctionComponent<{ id: string; display: CoreToolboxDisplay }> = ({ id, display }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const instance = useSelector(useCallback((state: AppState) => getInstance(state, id), [id]));
  const stats = useSelector(useCallback((state: AppState) => getInstanceStats(state, id), [id]));

  switch (display) {
    case 'show':
      if (!stats.hasShown) {
        return null;
      }
      break;

    case 'hide':
      if (!stats.hasHidden) {
        return null;
      }
      break;
  }

  const handleClick = () => {
    setOpen(!open);
  };

  const displayClass = display === 'show' ? null : classes.indent1;
  const useClass = stats.use === 'used' ? null : classes[stats.use];

  return (
    <>
      <ListItem button onClick={handleClick} className={clsx(displayClass, useClass)}>
        <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>

        <ListItemText primary={instance.instanceName} />

        <ListItemSecondaryAction>
          <InstanceMenuButton id={instance.id} />
        </ListItemSecondaryAction>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {instance.plugins.map((pluginId) => (
            <Plugin key={pluginId} id={pluginId} display={display} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const Plugin: FunctionComponent<{ id: string; display: CoreToolboxDisplay }> = ({ id, display }) => {
  const classes = useStyles();
  const plugin = useSelector(useCallback((state: AppState) => getPlugin(state, id), [id]));
  const stats = useSelector(useCallback((state: AppState) => getPluginStats(state, id), [id]));
  const definition: ComponentDefinition = useMemo(() => ({ type: 'plugin', id }), [id]);

  if (display !== plugin.toolboxDisplay) {
    return null;
  }

  const displayClass = display === 'show' ? classes.indent1 : classes.indent2;
  const useClass = stats.use === 'used' ? null : classes[stats.use];

  return (
    <ListItem className={clsx(displayClass, useClass)}>
      <ListItemIcon>
        <DragButton definition={definition} />
      </ListItemIcon>

      <ListItemText primary={`${plugin.module}.${plugin.name}`} secondary={plugin.description} />

      <ListItemSecondaryAction>
        <PluginMenuButton id={plugin.id} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const DragButton: FunctionComponent<{ definition: ComponentDefinition }> = ({ definition }) => {
  const classes = useStyles();
  const create = useCreate(definition);
  const { ref } = useCreatable(definition, create);

  return (
    <Tooltip title="Drag and drop sur le canvas pour ajouter un composant">
      <IconButton disableRipple className={classes.dragSource} ref={ref}>
        <ComponentIcon />
      </IconButton>
    </Tooltip>
  );
};

function useCreate(definition: ComponentDefinition) {
  const tabId = useTabPanelId();
  const templateId = useSelector((state: AppState) => getActiveTemplateId(state, tabId));
  const dispatch = useDispatch();
  const makeNewId = useMakeNewId();
  const selectComponent = useSelectComponent();
  const fireAsync = useFireAsync();
  const waitForComponentId = useWaitForComponentId();

  return useCallback(
    async (position: Position) =>
      fireAsync(async () => {
        const componentId = makeNewId();
        await dispatch(setComponent({ templateId, componentId, definition, position }));
        const id = `${tabId}:${templateId || ''}:${componentId}`;
        await waitForComponentId(id);
        selectComponent(id);
      }),
    [fireAsync, dispatch, tabId, templateId, definition, makeNewId]
  );
}

function useMakeNewId() {
  const componentIds = useTabSelector(getComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const set = useMemo(() => new Set(componentIds.map(id => componentsMap[id].componentId)), [componentIds, componentsMap]);

  return useCallback(() => {
    for (let i = 1; ; ++i) {
      const candidate = `new-${i}`;
      if (!set.has(candidate)) {
        return candidate;
      }
    }
  }, [set]);
}

/**
 * Wait for a component id to be present in the store
 */ 
function useWaitForComponentId() {
  // FIXME
  const componentIds = useTabSelector(getComponentIds);
  const set = useMemo(() => new Set(componentIds), [componentIds]);

  const updateHandlerRef = useRef<(set: Set<string>) => void>(null);

  useEffect(() => {
    const updateHandler = updateHandlerRef.current;
    if (updateHandler) {
      updateHandler(set);
    }
  }, [set]);

  return useCallback(
    (componentId: string) => {
      const deferred = new Deferred<void>();

      const updateHandler = (set: Set<string>) => {
        if (set.has(componentId)) {
          updateHandlerRef.current = null;
          deferred.resolve();
        }
      };

      updateHandlerRef.current = updateHandler;

      return deferred.promise;
    },
    [updateHandlerRef]
  );
}
