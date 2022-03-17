import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabType, UpdateTabAction } from '../tabs/types';
import { ActionTypes, CoreDesignerState, DesignerTabActionData, CoreOpenedProject, UpdateProjectNotification, SetNameProjectNotification, Plugin, Component, Binding, MemberType, Instance, Selection, MultiSelectionIds, ComponentsSelection, BindingSelection } from './types';
import { createTable, tableAdd, tableRemove, tableRemoveAll, tableClear, tableSet, arrayAdd, arrayRemove, arraySet } from '../common/reducer-tools';
import { ClearCoreBindingNotification, ClearCoreComponentNotification, ClearCorePluginNotification, CorePluginData, RenameCoreComponentNotification, SetCoreBindingNotification, SetCoreComponentNotification, SetCorePluginNotification, SetCorePluginsNotification, SetCorePluginToolboxDisplayNotification } from '../../../../shared/project-manager';

const initialState: CoreDesignerState = {
  openedProjects: createTable<CoreOpenedProject>(),
  instances: createTable<Instance>(),
  plugins: createTable<Plugin>(),
  components: createTable<Component>(),
  bindings: createTable<Binding>(),
};

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.CORE_DESIGNER) {
      return;
    }

    const { projectId } = data as DesignerTabActionData;

    const openedProject: CoreOpenedProject = {
      id,
      projectId,
      notifierId: null,
      instances: [],
      plugins: [],
      components: [],
      bindings: [],
      selection: null,
    };

    tableAdd(state.openedProjects, openedProject);
  },

  [TabsActionTypes.UPDATE]: (state, action: PayloadAction<UpdateTabAction>) => {
    const { id, data } = action.payload;
    const openedProject = state.openedProjects.byId[id];
    if (openedProject) {
      // else it's another type
      const { projectId } = data as DesignerTabActionData;
      openedProject.projectId = projectId;
    }
  },

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<{ tabId: string; }>) => {
    const { tabId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    tableRemoveAll(state.instances, openedProject.instances);
    tableRemoveAll(state.plugins, openedProject.plugins);
    tableRemoveAll(state.components, openedProject.components);
    tableRemoveAll(state.bindings, openedProject.bindings);
    tableRemove(state.openedProjects, tabId);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<{ tabId: string; notifierId: string; }>) => {
    const { tabId, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;
      openedProject.selection = null;
      openedProject.instances = [];
      openedProject.plugins = [];
      openedProject.components = [];
      openedProject.bindings = [];
    }

    tableClear(state.instances);
    tableClear(state.plugins);
    tableClear(state.components);
    tableClear(state.bindings);
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ tabId: string; update: UpdateProjectNotification; }[]>) => {
    for (const { tabId, update } of action.payload) {
      const openedProject = state.openedProjects.byId[tabId];
      applyProjectUpdate(state, openedProject, update);
    }
  },

  [ActionTypes.SELECT]: (state, action: PayloadAction<{ tabId: string; selection: Selection }>) => {
    const { tabId, selection } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.selection = selection;
  },

  [ActionTypes.TOGGLE_COMPONENT_SELECTION]: (state, action: PayloadAction<{ tabId: string; componentId: string }>) => {
    const { tabId, componentId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    
    if (openedProject.selection?.type !== 'components') {
      const newSelection: ComponentsSelection = { type: 'components', ids: {} };
      openedProject.selection = newSelection;
    }

    const selection = openedProject.selection as ComponentsSelection;
    toggleSelection(selection.ids, componentId);

    if (Object.keys(selection.ids).length === 0) {
      openedProject.selection = null;
    }
  },
});

function applyProjectUpdate(state: CoreDesignerState, openedProject: CoreOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const { name } = update as SetNameProjectNotification;
      openedProject.projectId = name;
      break;
    }

    case 'reset': {
      tableRemoveAll(state.instances, openedProject.instances);
      tableRemoveAll(state.plugins, openedProject.plugins);
      tableRemoveAll(state.components, openedProject.components);
      tableRemoveAll(state.bindings, openedProject.bindings);

      openedProject.selection = null;
      openedProject.instances = [];
      openedProject.plugins = [];
      openedProject.components = [];
      openedProject.bindings = [];

      break;
    }

    case 'set-core-plugins': {
      tableRemoveAll(state.instances, openedProject.instances);
      tableRemoveAll(state.plugins, openedProject.plugins);

      const { plugins } = update as SetCorePluginsNotification;

      for (const [pluginId, pluginData] of Object.entries(plugins)) {
        setPlugin(state, openedProject, pluginId, pluginData);
      }

      // sort filled instances
      for (const id of openedProject.instances) {
        const instance = state.instances.byId[id];
        updateInstanceStats(state, id);
        instance.plugins.sort();
      }

      break;
    }

    case 'set-core-plugin-toolbox-display': {
      const { id: pluginId, display } = update as SetCorePluginToolboxDisplayNotification;
      const id = `${openedProject.id}:${pluginId}`;
      const plugin = state.plugins.byId[id];
      plugin.toolboxDisplay = display;

      updateInstanceStats(state, plugin.instance);

      break;
    }

    case 'set-core-plugin': {
      const { id: pluginId, plugin: pluginData } = update as SetCorePluginNotification;
      const id = `${openedProject.id}:${pluginId}`;
      const { instance } = setPlugin(state, openedProject, id, pluginData);

      updateInstanceStats(state, instance.id);
      instance.plugins.sort();
      
      break;
    }

    case 'clear-core-plugin': {
      const { id: pluginId } = update as ClearCorePluginNotification;
      const id = `${openedProject.id}:${pluginId}`;
      const plugin = state.plugins.byId[id];

      if (plugin.use !== 'unused') {
        throw new Error(`Receive notification to delete plugin '${id}' which is used!`);
      }

      const instance = state.instances.byId[plugin.instance];

      arrayRemove(openedProject.plugins, id);
      arrayRemove(instance.plugins, id);
      tableRemove(state.plugins, id);

      if (instance.plugins.length === 0) {
        tableRemove(state.instances, instance.id);
      } else {
        updateInstanceStats(state, instance.id);
      }

      break;
    }

    case 'set-core-component': {
      const { id: componentId, component } = update as SetCoreComponentNotification;
      const id = `${openedProject.id}:${componentId}`;
      const pluginId = `${openedProject.id}:${component.plugin}`;
      tableSet(state.components, { ...component, id, componentId, bindings: {}, plugin: pluginId }, true);

      const plugin = state.plugins.byId[pluginId];
      arrayAdd(openedProject.components, id, true);
      arrayAdd(plugin.components, id, true);
      updatePluginStats(state, openedProject, plugin);
      updateInstanceStats(state, plugin.instance);

      // This can be a component update, so also reindex its bindings
      for (const bindingId of openedProject.bindings) {
        const binding = state.bindings.byId[bindingId];
        if (binding.sourceComponent === id) {
          addBinding(state, binding.sourceComponent, binding.sourceState, binding.id);
        }

        if (binding.targetComponent === id) {
          addBinding(state, binding.targetComponent, binding.targetAction, binding.id);
        }
      }

      break;
    }

    case 'clear-core-component': {
      const { id: componentId } = update as ClearCoreComponentNotification;
      const id = `${openedProject.id}:${componentId}`;
      const component = state.components.byId[id];
      const plugin = state.plugins.byId[component.plugin];

      arrayRemove(plugin.components, id);
      arrayRemove(openedProject.components, id);
      tableRemove(state.components, id);
      updatePluginStats(state, openedProject, plugin);
      updateInstanceStats(state, plugin.instance);
      unselectComponent(openedProject, id);
      break;
    }

    case 'rename-core-component': {
      const { id, newId } = update as RenameCoreComponentNotification;
      const component = state.components.byId[id];
      const plugin = state.plugins.byId[component.plugin];

      tableRemove(state.components, id);
      arrayRemove(openedProject.components, component.id);
      arrayRemove(plugin.components, component.id);

      component.id = newId;

      tableSet(state.components, component, true);
      arrayAdd(plugin.components, component.id, true);
      arrayAdd(openedProject.components, component.id, true);

      updatePluginStats(state, openedProject, plugin);
      updateInstanceStats(state, plugin.instance);
      renameComponentSelection(openedProject, id, newId);
      break;
    }

    case 'set-core-binding': {
      const { id: bindingId, binding: bindingData } = update as SetCoreBindingNotification;
      const { sourceComponent: sourceComponentId, targetComponent: targetComponentId, ...data } = bindingData;
      const binding = {
        id: `${openedProject.id}:${bindingId}`,
        sourceComponent: `${openedProject.id}:${sourceComponentId}`,
        targetComponent: `${openedProject.id}:${targetComponentId}`,
        ...data
      };

      tableSet(state.bindings, binding, true);
      arrayAdd(openedProject.bindings, binding.id, true);
      addBinding(state, binding.sourceComponent, binding.sourceState, binding.id);
      addBinding(state, binding.targetComponent, binding.targetAction, binding.id);
      break;
    }

    case 'clear-core-binding': {
      const { id: bindingId } = update as ClearCoreBindingNotification;
      const id = `${openedProject.id}:${bindingId}`;
      const binding = state.bindings.byId[id];
      arrayRemove(openedProject.bindings, id);
      tableRemove(state.bindings, id);
      removeBinding(state, binding.sourceComponent, binding.sourceState, id);
      removeBinding(state, binding.targetComponent, binding.targetAction, id);
      unselectBinding(openedProject, id);
      break;
    }

    default:
      throw new Error(`Unhandled update operation: ${update.operation}`);
  }
}

function setPlugin(state: CoreDesignerState, openedProject: CoreOpenedProject, pluginId: string, pluginData: CorePluginData) {
  const id = `${openedProject.id}:${pluginId}`;
  const { instanceName, ...data } = pluginData;
  const instanceId = `${openedProject.id}:${instanceName}`;
  const plugin: Plugin = {
    id,
    ...data,
    instance: instanceId,
    stateIds: [],
    actionIds: [],
    configIds: [],
    use: 'unused',
    components: [],
  };

  for (const [name, { memberType }] of Object.entries(plugin.members)) {
    switch (memberType) {
      case MemberType.STATE:
        plugin.stateIds.push(name);
        break;
      case MemberType.ACTION:
        plugin.actionIds.push(name);
        break;
    }
  }

  for (const name of Object.keys(plugin.config)) {
    plugin.configIds.push(name);
  }

  plugin.stateIds.sort();
  plugin.actionIds.sort();
  plugin.configIds.sort();

  updatePluginStats(state, openedProject, plugin, true);
  tableSet(state.plugins, plugin, true);
  arrayAdd(openedProject.plugins, plugin.id, true);

  let instance = state.instances.byId[instanceId];
  if (!instance) {
    instance = { id: instanceId, instanceName, plugins: [], use: 'unused', hasShown: false, hasHidden: false };
    tableSet(state.instances, instance, true);
    arrayAdd(openedProject.instances, instance.id, true);
  }

  arraySet(instance.plugins, plugin.id, true);

  return { plugin, instance };
}

function updatePluginStats(state: CoreDesignerState, openedProject: CoreOpenedProject, plugin: Plugin, rebuildComponentList = false) {
  if (rebuildComponentList) {
    const components: string[] = [];

    for (const componentId of Object.values(openedProject.components)) {
      const component = state.components.byId[componentId];
      if (component.plugin === plugin.id) {
        components.push(component.id);
      }
    }

    components.sort();

    plugin.components = components;
  }

  plugin.use = 'unused';

  for (const componentId of plugin.components) {
    const component = state.components.byId[componentId];

    if (component.external) {
      plugin.use = 'external';
      continue;
    }

    plugin.use = 'used';
    break;
  }
}

function updateInstanceStats(state: CoreDesignerState, id: string) {
  const instance = state.instances.byId[id];
  instance.use = 'unused';
  instance.hasShown = false;
  instance.hasHidden = false;

  for (const pluginId of instance.plugins) {
    const plugin = state.plugins.byId[pluginId];

    switch (plugin.toolboxDisplay) {
      case 'show':
        instance.hasShown = true;
        break;

      case 'hide':
        instance.hasHidden = true;
        break;
    }

    switch (plugin.use) {
      case 'used':
        instance.use = 'used';
        break;

      case 'external':
        if (instance.use === 'unused') {
          instance.use = 'external';
        }
        break;
    }
  }
}

function addBinding(state: CoreDesignerState, componentId: string, member: string, bindingId: string) {
  const component = state.components.byId[componentId];
  if (!component.bindings[member]) {
    component.bindings[member] = [];
  }

  arrayAdd(component.bindings[member], bindingId, true);
}

function removeBinding(state: CoreDesignerState, componentId: string, member: string, bindingId: string) {
  const component = state.components.byId[componentId];
  arrayRemove(component.bindings[member], bindingId);
  if (component.bindings[member].length === 0) {
    delete component.bindings[member];
  }
}

function toggleSelection(ids: MultiSelectionIds, id: string) {
  if(ids[id]) {
    delete ids[id];
  } else {
    ids[id] = true;
  }
}

function renameComponentSelection(openedProject: CoreOpenedProject, oldId: string, newId: string) {
  if (openedProject.selection?.type !== 'components') {
    return;
  } 
  
  const selection = openedProject.selection as ComponentsSelection;

  if (selection.ids[oldId]) {
    delete selection.ids[oldId];
    selection.ids[newId] = true;
  }
}

function unselectComponent(openedProject: CoreOpenedProject, componentId: string) {
  if (openedProject.selection?.type !== 'components') {
    return;
  } 
  
  const selection = openedProject.selection as ComponentsSelection;

  delete selection.ids[componentId];

  if (Object.keys(selection.ids).length === 0) {
    openedProject.selection = null;
  }
}

function unselectBinding(openedProject: CoreOpenedProject, bindingId: string) {
  if (openedProject.selection?.type !== 'binding') {
    return;
  } 
  
  const selection = openedProject.selection as BindingSelection;
  
  if (selection.id === bindingId) {
    openedProject.selection = null;
  }
}