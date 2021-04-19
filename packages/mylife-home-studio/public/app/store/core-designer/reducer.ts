import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabType, UpdateTabAction } from '../tabs/types';
import { ActionTypes, CoreDesignerState, DesignerTabActionData, CoreOpenedProject, UpdateProjectNotification, SetNameProjectNotification, Plugin, Component, Binding, MemberType, Instance, Position } from './types';
import { createTable, tableAdd, tableRemove, tableSet, arrayAdd, arrayRemove } from '../common/reducer-tools';
import { ClearCoreBindingNotification, ClearCoreComponentNotification, ClearCorePluginNotification, RenameCoreComponentNotification, SetCoreBindingNotification, SetCoreComponentNotification, SetCorePluginsNotification, SetCorePluginToolboxDisplayNotification } from '../../../../shared/project-manager';

const initialState: CoreDesignerState = {
  openedProjects: createTable<CoreOpenedProject>()
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
      instances: createTable<Instance>(),
      plugins: createTable<Plugin>(),
      components: createTable<Component>(),
      bindings: createTable<Binding>()
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

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<{ id: string; }>) => {
    const { id } = action.payload;

    tableRemove(state.openedProjects, id);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<{ id: string; notifierId: string; }>) => {
    const { id, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[id];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;

      openedProject.instances = createTable<Instance>();
      openedProject.plugins = createTable<Plugin>();
      openedProject.components = createTable<Component>();
      openedProject.bindings = createTable<Binding>();
    }
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<{ id: string; update: UpdateProjectNotification; }[]>) => {
    for (const { id, update } of action.payload) {
      const openedProject = state.openedProjects.byId[id];
      applyProjectUpdate(openedProject, update);
    }
  },
});

function applyProjectUpdate(openedProject: CoreOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const { name } = update as SetNameProjectNotification;
      openedProject.projectId = name;
      break;
    }

    case 'set-core-plugins': {
      openedProject.instances = createTable<Instance>();
      openedProject.plugins = createTable<Plugin>();

      const { plugins } = update as SetCorePluginsNotification;

      for (const [id, pluginData] of Object.entries(plugins)) {
        const plugin: Plugin = {
          id,
          ...pluginData,
          stateIds: [],
          actionIds: [],
          configIds: [],
          use: 'unused',
          components: []
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

        updatePluginStats(openedProject, plugin, true);

        tableSet(openedProject.plugins, plugin, true);

        let instance = openedProject.instances.byId[plugin.instanceName];
        if (!instance) {
          instance = { id: plugin.instanceName, plugins: [], use: 'unused', hasShown: false, hasHidden: false };
          tableSet(openedProject.instances, instance, true);
        }

        instance.plugins.push(plugin.id);
        updateInstanceStats(openedProject, instance.id);
      }

      // sort filled instances
      for (const instance of Object.values(openedProject.instances.byId)) {
        instance.plugins.sort();
      }

      break;
    }

    case 'set-core-plugin-toolbox-display': {
      const { id, display } = update as SetCorePluginToolboxDisplayNotification;
      const plugin = openedProject.plugins.byId[id];
      plugin.toolboxDisplay = display;

      updateInstanceStats(openedProject, plugin.instanceName);

      break;
    }

    case 'clear-core-plugin': {
      const { id } = update as ClearCorePluginNotification;
      const plugin = openedProject.plugins.byId[id];
      if (plugin.use !== 'unused') {
        throw new Error(`Receive notification to delete plugin '${id}' which is used!`);
      }

      const instance = openedProject.instances.byId[plugin.instanceName];

      tableRemove(openedProject.plugins, id);
      arrayRemove(instance.plugins, id);

      if (instance.plugins.length === 0) {
        tableRemove(openedProject.instances, instance.id);
      } else {
        updateInstanceStats(openedProject, instance.id);
      }

      break;
    }

    case 'set-core-component': {
      const { id, component } = update as SetCoreComponentNotification;
      tableSet(openedProject.components, { id, bindings: {}, ...component }, true);

      const plugin = openedProject.plugins.byId[component.plugin];
      arrayAdd(plugin.components, id, true);
      updatePluginStats(openedProject, plugin);
      updateInstanceStats(openedProject, plugin.instanceName);
      break;
    }

    case 'clear-core-component': {
      const { id } = update as ClearCoreComponentNotification;
      const component = openedProject.components.byId[id];
      const plugin = openedProject.plugins.byId[component.plugin];

      tableRemove(openedProject.components, id);
      arrayRemove(plugin.components, component.id);
      updatePluginStats(openedProject, plugin);
      updateInstanceStats(openedProject, plugin.instanceName);
      break;
    }

    case 'rename-core-component': {
      const { id, newId } = update as RenameCoreComponentNotification;
      const component = openedProject.components.byId[id];
      const plugin = openedProject.plugins.byId[component.plugin];

      tableRemove(openedProject.components, id);
      arrayRemove(plugin.components, component.id);

      component.id = newId;

      tableSet(openedProject.components, component, true);
      arrayAdd(plugin.components, component.id, true);

      updatePluginStats(openedProject, plugin);
      updateInstanceStats(openedProject, plugin.instanceName);
      break;
    }

    case 'set-core-binding': {
      const { id, binding } = update as SetCoreBindingNotification;
      tableSet(openedProject.bindings, { id, ...binding }, true);
      addBinding(openedProject, binding.sourceComponent, binding.sourceState, id);
      addBinding(openedProject, binding.targetComponent, binding.targetAction, id);
      break;
    }

    case 'clear-core-binding': {
      const { id } = update as ClearCoreBindingNotification;
      const binding = openedProject.bindings.byId[id];
      tableRemove(openedProject.bindings, id);
      removeBinding(openedProject, binding.sourceComponent, binding.sourceState, id);
      removeBinding(openedProject, binding.targetComponent, binding.targetAction, id);
      break;
    }

    default:
      throw new Error(`Unhandled update operation: ${update.operation}`);
  }
}

function updatePluginStats(openedProject: CoreOpenedProject, plugin: Plugin, rebuildComponentList = false) {
  if (rebuildComponentList) {
    const components: string[] = [];

    for (const component of Object.values(openedProject.components.byId)) {
      if (component.plugin === plugin.id) {
        components.push(component.id);
      }
    }

    components.sort();

    plugin.components = components;
  }

  plugin.use = 'unused';

  for (const componentId of plugin.components) {
    const component = openedProject.components.byId[componentId];

    if (component.external) {
      plugin.use = 'external';
      continue;
    }

    plugin.use = 'used';
    break;
  }
}

function updateInstanceStats(openedProject: CoreOpenedProject, instanceName: string) {
  const instance = openedProject.instances.byId[instanceName];
  instance.use = 'unused';
  instance.hasShown = false;
  instance.hasHidden = false;

  for (const pluginId of instance.plugins) {
    const plugin = openedProject.plugins.byId[pluginId];

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

function addBinding(openedProject: CoreOpenedProject, componentId: string, member: string, binding: string) {
  const component = openedProject.components.byId[componentId];
  if (!component.bindings[member]) {
    component.bindings[member] = [];
  }

  arrayAdd(component.bindings[member], binding, true);
}

function removeBinding(openedProject: CoreOpenedProject, componentId: string, member: string, binding: string) {
  const component = openedProject.components.byId[componentId];
  arrayRemove(component.bindings[member], binding);
  if (component.bindings[member].length === 0) {
    delete component.bindings[member];
  }
}