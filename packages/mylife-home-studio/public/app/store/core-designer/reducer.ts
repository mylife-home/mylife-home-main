import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { ActionTypes as TabsActionTypes, NewTabAction, TabType, UpdateTabAction } from '../tabs/types';
import { ActionTypes, ActionPayloads, CoreDesignerState, DesignerTabActionData, CoreOpenedProject, UpdateProjectNotification, SetNameProjectNotification, Plugin, Template, Component, Binding, MemberType, Instance, Selection, MultiSelectionIds, ComponentsSelection, BindingSelection, View, ComponentDefinition } from './types';
import { createTable, tableAdd, tableRemove, tableRemoveAll, tableClear, tableSet, arrayAdd, arrayRemove, arraySet } from '../common/reducer-tools';
import { ClearCoreBindingNotification, ClearCoreComponentNotification, ClearCorePluginNotification, ClearCoreTemplateNotification, CoreComponentDefinitionType, CorePluginData, RenameCoreComponentNotification, RenameCoreTemplateNotification, SetCoreBindingNotification, SetCoreComponentNotification, SetCorePluginNotification, SetCorePluginsNotification, SetCorePluginToolboxDisplayNotification, SetCoreTemplateNotification } from '../../../../shared/project-manager';

const initialState: CoreDesignerState = {
  openedProjects: createTable<CoreOpenedProject>(),
  instances: createTable<Instance>(),
  plugins: createTable<Plugin>(),
  templates: createTable<Template>(),
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
      templates: [],
      components: [],
      bindings: [],
      activeTemplate: null,
      viewSelection: null,
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

  [ActionTypes.REMOVE_OPENED_PROJECT]: (state, action: PayloadAction<ActionPayloads.RemoveOpenedProject>) => {
    const { tabId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    tableRemoveAll(state.instances, openedProject.instances);
    tableRemoveAll(state.plugins, openedProject.plugins);
    tableRemoveAll(state.components, openedProject.components);
    tableRemoveAll(state.bindings, openedProject.bindings);
    tableRemove(state.openedProjects, tabId);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<ActionPayloads.SetNotifier>) => {
    const { tabId, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action: PayloadAction<ActionPayloads.ClearAllNotifiers>) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;
      openedProject.activeTemplate = null;
      openedProject.viewSelection = null;
      openedProject.instances = [];
      openedProject.plugins = [];
      openedProject.templates = [];
      openedProject.components = [];
      openedProject.bindings = [];
    }

    tableClear(state.instances);
    tableClear(state.plugins);
    tableClear(state.templates);
    tableClear(state.components);
    tableClear(state.bindings);
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<ActionPayloads.UpdateProject>) => {
    for (const { tabId, update } of action.payload) {
      const openedProject = state.openedProjects.byId[tabId];
      applyProjectUpdate(state, openedProject, update);
    }
  },

  [ActionTypes.ACTIVATE_VIEW]: (state, action: PayloadAction<ActionPayloads.ActivateView>) => {
    const { tabId, templateId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.activeTemplate = templateId;
    openedProject.viewSelection = null;
  },

  [ActionTypes.SELECT]: (state, action: PayloadAction<ActionPayloads.Select>) => {
    const { tabId, selection } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.viewSelection = selection;
  },

  [ActionTypes.TOGGLE_COMPONENT_SELECTION]: (state, action: PayloadAction<ActionPayloads.ToggleComponentSelection>) => {
    const { tabId, componentId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    
    if (openedProject.viewSelection?.type !== 'components') {
      const newSelection: ComponentsSelection = { type: 'components', ids: {} };
      openedProject.viewSelection = newSelection;
    }

    const selection = openedProject.viewSelection as ComponentsSelection;
    toggleSelection(selection.ids, componentId);

    if (Object.keys(selection.ids).length === 0) {
      openedProject.viewSelection = null;
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
      tableRemoveAll(state.templates, openedProject.templates);
      tableRemoveAll(state.components, openedProject.components);
      tableRemoveAll(state.bindings, openedProject.bindings);

      openedProject.activeTemplate = null;
      openedProject.viewSelection = null;
      openedProject.instances = [];
      openedProject.plugins = [];
      openedProject.templates = [];
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

      break;
    }

    case 'set-core-plugin-toolbox-display': {
      const { id: pluginId, display } = update as SetCorePluginToolboxDisplayNotification;
      const id = `${openedProject.id}:${pluginId}`;
      const plugin = state.plugins.byId[id];
      plugin.toolboxDisplay = display;
      break;
    }

    case 'set-core-plugin': {
      const { id: pluginId, plugin: pluginData } = update as SetCorePluginNotification;
      setPlugin(state, openedProject, pluginId, pluginData);
      
      break;
    }

    case 'clear-core-plugin': {
      const { id: pluginId } = update as ClearCorePluginNotification;
      const id = `${openedProject.id}:${pluginId}`;
      const plugin = state.plugins.byId[id];

      if (plugin.usageComponents.length > 0) {
        throw new Error(`Receive notification to delete plugin '${id}' which is used!`);
      }

      const instance = state.instances.byId[plugin.instance];

      arrayRemove(openedProject.plugins, id);
      arrayRemove(instance.plugins, id);
      tableRemove(state.plugins, id);

      if (instance.plugins.length === 0) {
        arrayRemove(openedProject.instances, instance.id);
        tableRemove(state.instances, instance.id);
      }

      break;
    }

    case 'set-core-template': {
      const { id: templateId, exports } = update as SetCoreTemplateNotification;
      const id = `${openedProject.id}:${templateId}`;

      let template = state.templates.byId[id];

      if (!template) {
        template = {
          id,
          templateId,
          components: [],
          bindings: [],
          exports: { config: {}, members: {} },
          usageComponents: [],
        };

        tableSet(state.templates, template, true);
        arrayAdd(openedProject.templates, template.id, true);
      }

      // Should we avoid whole exports reset?
      template.exports = {
        config: {},
        members: {},
      };

      const { config, members } = template.exports;

      for (const [id, configExport] of Object.entries(exports.config)) {
        config[id] = {
          component: `${openedProject.id}:${templateId || ''}:${configExport.component}`,
          configName: configExport.configName
        };
      }

      for (const [id, memberExport] of Object.entries(exports.members)) {
        members[id] = {
          component: `${openedProject.id}:${templateId || ''}:${memberExport.component}`,
          member: memberExport.member
        };
      }

      break;
    }

    case 'clear-core-template': {
      const { id: templateId } = update as ClearCoreTemplateNotification;

      const id = `${openedProject.id}:${templateId}`;

      const template = state.templates.byId[id];

      // clear plugins links
      for (const componentId of template.components) {
        const component = state.components.byId[componentId];
        unregisterComponentFromDefinition(state, openedProject, component);
      }

      // remove all bindings+components
      // Note: we don't care about links, all will be dropped
      tableRemoveAll(state.components, template.components);
      tableRemoveAll(state.bindings, template.bindings);
      tableRemove(state.templates, template.id);
      arrayRemove(openedProject.templates, template.id);

      if (openedProject.activeTemplate === id) {
        openedProject.activeTemplate = null;
        openedProject.viewSelection = null;
      }

      break;
    }

    case 'rename-core-template': {
      const { id: oldTemplateId, newId: newTemplateId } = update as RenameCoreTemplateNotification;

      const oldId = `${openedProject.id}:${oldTemplateId}`;
      const newId = `${openedProject.id}:${newTemplateId}`;

      const template = state.templates.byId[oldId];

      tableRemove(state.templates, template.id);
      arrayRemove(openedProject.templates, template.id);

      template.id = newId;
      template.templateId = newTemplateId;

      tableSet(state.templates, template, true);
      arrayAdd(openedProject.templates, template.id, true);

      if (openedProject.activeTemplate === oldId) {
        openedProject.activeTemplate = newId;
      }

      // rename all bindings+components
      for (const id of template.components) {
        const component = state.components.byId[id];
        const newId = `${openedProject.id}:${newTemplateId}:${component.componentId}`;

        tableRemove(state.components, id);
        arrayRemove(template.components, component.id);
        unregisterComponentFromDefinition(state, openedProject, component);

        component.id = newId;

        tableSet(state.components, component, true);
        registerComponentOnDefinition(state, openedProject, component);
        arrayAdd(template.components, component.id, true);

        renameComponentSelection(openedProject, template.templateId, id, newId);

        for (const bindingId of Object.values(component.bindings).flat()) {
          const binding = state.bindings.byId[bindingId];

          if (binding.sourceComponent === id) {
            binding.sourceComponent = newId;
          }

          if (binding.targetComponent === id) {
            binding.targetComponent = newId;
          }

          // Note: we should also update ids, but it will be the case anyway below
        }
      }

      for (const id of template.bindings) {
        const binding = state.bindings.byId[id];
        // easier to split the binding and build it back
        const [projectId, oldTemplateId, ...remaining] = id.split(':');
        const newId = [projectId, newTemplateId, ...remaining].join(':');
        const sourceComponent = state.components.byId[binding.sourceComponent];
        const targetComponent = state.components.byId[binding.targetComponent];

        tableRemove(state.bindings, binding.id);
        arrayRemove(template.bindings, binding.id);
        arrayRemove(sourceComponent.bindings[binding.sourceState], binding.id);
        arrayRemove(targetComponent.bindings[binding.targetAction], binding.id);

        binding.id = newId;

        tableAdd(state.bindings, binding);
        arrayAdd(template.bindings, binding.id, true);
        arraySet(sourceComponent.bindings[binding.sourceState], binding.id, true);
        arraySet(targetComponent.bindings[binding.targetAction], binding.id, true);

        renameBindingSelection(openedProject, template.templateId, id, newId);
      }

      break;
    }

    case 'set-core-component': {
      const { templateId, id: componentId, component: componentData } = update as SetCoreComponentNotification;
      const id = `${openedProject.id}:${templateId || ''}:${componentId}`;
      const fullTemplateId = templateId && `${openedProject.id}:${templateId}`;

      const definition = {
        id: `${openedProject.id}:${componentData.definition.id}`,
        type: componentData.definition.type
      };

      const component: Component = { ...componentData, id, templateId: fullTemplateId, componentId, bindings: {}, definition };
      tableSet(state.components, component, true);

      const view = getView(state, openedProject, templateId);
      arraySet(view.components, id, true);
      registerComponentOnDefinition(state, openedProject, component);

      // This can be a component update, so also reindex its bindings
      for (const bindingId of view.bindings) {
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
      const { templateId, id: componentId } = update as ClearCoreComponentNotification;
      const id = `${openedProject.id}:${templateId || ''}:${componentId}`;
      const component = state.components.byId[id];
      
      const view = getView(state, openedProject, templateId);
      arrayRemove(view.components, id);
      unregisterComponentFromDefinition(state, openedProject, component);
      tableRemove(state.components, id);
      unselectComponent(openedProject, templateId, id);
      break;
    }

    case 'rename-core-component': {
      const { templateId, id: componentId, newId: newComponentId } = update as RenameCoreComponentNotification;
      const id = `${openedProject.id}:${templateId || ''}:${componentId}`;
      const newId = `${openedProject.id}:${templateId || ''}:${newComponentId}`;
      const component = state.components.byId[id];

      const view = getView(state, openedProject, templateId);
      tableRemove(state.components, id);
      arrayRemove(view.components, component.id);
      unregisterComponentFromDefinition(state, openedProject, component);

      component.id = newId;
      component.componentId = newComponentId;

      tableSet(state.components, component, true);
      registerComponentOnDefinition(state, openedProject, component);
      arrayAdd(view.components, component.id, true);

      renameComponentSelection(openedProject, templateId, id, newId);
      break;
    }

    case 'set-core-binding': {
      const { templateId, id: bindingId, binding: bindingData } = update as SetCoreBindingNotification;
      const { sourceComponent: sourceComponentId, targetComponent: targetComponentId, ...data } = bindingData;
      const binding: Binding = {
        id: `${openedProject.id}:${templateId || ''}:${bindingId}`,
        sourceComponent: `${openedProject.id}:${templateId || ''}:${sourceComponentId}`,
        targetComponent: `${openedProject.id}:${templateId || ''}:${targetComponentId}`,
        ...data
      };

      const view = getView(state, openedProject, templateId);
      tableSet(state.bindings, binding, true);
      arraySet(view.bindings, binding.id, true);
      addBinding(state, binding.sourceComponent, binding.sourceState, binding.id);
      addBinding(state, binding.targetComponent, binding.targetAction, binding.id);
      break;
    }

    case 'clear-core-binding': {
      const { templateId, id: bindingId } = update as ClearCoreBindingNotification;
      const id = `${openedProject.id}:${templateId || ''}:${bindingId}`;
      const binding = state.bindings.byId[id];
      const view = getView(state, openedProject, templateId);
      arrayRemove(view.bindings, id);
      tableRemove(state.bindings, id);
      removeBinding(state, binding.sourceComponent, binding.sourceState, id);
      removeBinding(state, binding.targetComponent, binding.targetAction, id);
      unselectBinding(openedProject, templateId, id);
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
  let instance = state.instances.byId[instanceId];
  if (!instance) {
    instance = { id: instanceId, instanceName, plugins: [] };
    tableSet(state.instances, instance, true);
    arrayAdd(openedProject.instances, instance.id, true);
  }

  const pluginBaseData: Omit<Plugin, 'id' | 'usageComponents'> = {
    ...data,
    instance: instanceId,
  };

  let plugin = state.plugins.byId[id];

  if (!plugin) {
    plugin = {
      id,
      usageComponents: [],
      ...pluginBaseData
    }

    tableSet(state.plugins, plugin, true);
    arraySet(openedProject.plugins, plugin.id, true);
  } else {
    // keep existing id + usageComponents, overwrite other
    Object.assign(plugin, pluginBaseData);
  }

  arraySet(instance.plugins, plugin.id, true);
}

function registerComponentOnDefinition(state: CoreDesignerState,openedProject: CoreOpenedProject, component: Component) {
  const { id, definition } = component;
  switch (definition.type) {
    case 'plugin': {
      const plugin = state.plugins.byId[definition.id];
      arraySet(plugin.usageComponents, id, true);
      break;
    }

    case 'template': {
      const template = state.templates.byId[definition.id];
      arraySet(template.usageComponents, id, true);
      break;
    }
  }
}

function unregisterComponentFromDefinition(state: CoreDesignerState,openedProject: CoreOpenedProject, component: Component) {
  const { id, definition } = component;
  switch (definition.type) {
    case 'plugin': {
      const plugin = state.plugins.byId[definition.id];
      arrayRemove(plugin.usageComponents, id);
      break;
    }

    case 'template': {
      const template = state.templates.byId[definition.id];
      arrayRemove(template.usageComponents, id);
      break;
    }
  }
}

function addBinding(state: CoreDesignerState, componentId: string, member: string, bindingId: string) {
  const component = state.components.byId[componentId];
  if (!component.bindings[member]) {
    component.bindings[member] = [];
  }

  arraySet(component.bindings[member], bindingId, true);
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

function renameComponentSelection(openedProject: CoreOpenedProject, partialTemplateId: string, oldId: string, newId: string) {
  const templateId = partialTemplateId ? `${openedProject.id}:${partialTemplateId}` : null;
  if (openedProject.activeTemplate !== templateId) {
    return;
  }

  if (openedProject.viewSelection?.type !== 'components') {
    return;
  } 
  
  const selection = openedProject.viewSelection as ComponentsSelection;

  if (selection.ids[oldId]) {
    delete selection.ids[oldId];
    selection.ids[newId] = true;
  }
}

function renameBindingSelection(openedProject: CoreOpenedProject, partialTemplateId: string, oldId: string, newId: string) {
  const templateId = partialTemplateId ? `${openedProject.id}:${partialTemplateId}` : null;
  if (openedProject.activeTemplate !== templateId) {
    return;
  }

  if (openedProject.viewSelection?.type !== 'binding') {
    return;
  }

  const selection = openedProject.viewSelection as BindingSelection;

  if (selection.id === oldId) {
    selection.id = newId;
  }
}

function unselectComponent(openedProject: CoreOpenedProject, partialTemplateId: string, componentId: string) {
  const templateId = partialTemplateId ? `${openedProject.id}:${partialTemplateId}` : null;
  if (openedProject.activeTemplate !== templateId) {
    return;
  }

  if (openedProject.viewSelection?.type !== 'components') {
    return;
  } 
  
  const selection = openedProject.viewSelection as ComponentsSelection;

  delete selection.ids[componentId];

  if (Object.keys(selection.ids).length === 0) {
    openedProject.viewSelection = null;
  }
}

function unselectBinding(openedProject: CoreOpenedProject, partialTemplateId: string, bindingId: string) {
  const templateId = partialTemplateId ? `${openedProject.id}:${partialTemplateId}` : null;
  if (openedProject.activeTemplate !== templateId) {
    return;
  }

  if (openedProject.viewSelection?.type !== 'binding') {
    return;
  } 
  
  const selection = openedProject.viewSelection as BindingSelection;
  
  if (selection.id === bindingId) {
    openedProject.viewSelection = null;
  }
}

function getView(state: CoreDesignerState, openedProject: CoreOpenedProject, partialTemplateId: string): View {
  if (partialTemplateId) {
    return state.templates.byId[`${openedProject.id}:${partialTemplateId}`];
  } else {
    return openedProject;
  }
}
