import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  ClearUiResourceNotification,
  ClearUiWindowNotification,
  UiComponentData,
  RenameUiResourceNotification,
  RenameUiWindowNotification,
  SetNameProjectNotification,
  SetUiComponentDataNotification,
  SetUiDefaultWindowNotification,
  SetUiResourceNotification,
  SetUiWindowNotification,
  UpdateProjectNotification,
  SetUiStyleNotification,
  RenameUiStyleNotification,
  ClearUiStyleNotification,
  UiPluginData,
  SetUiTemplateNotification,
  ClearUiTemplateNotification,
  RenameUiTemplateNotification,
  UiControlData,
  UiTemplateInstanceData,
  UiTemplateInstanceBinding,
} from '../../../../shared/project-manager';
import { createTable, tableAdd, tableRemove, tableSet, tableRemoveAll, tableClear, arrayAdd, arraySet, arrayRemove } from '../common/reducer-tools';
import { ActionTypes as TabsActionTypes, UpdateTabAction, NewTabAction, TabType } from '../tabs/types';
import { ActionTypes, UiDesignerState, UiOpenedProject, DesignerTabActionData, UiComponent, UiPlugin, UiResource, UiWindow, UiTemplate, UiControl, Selection, ActionPayloads, UiStyle, UiViewType, UiView, UiTemplateInstance } from './types';

const initialState: UiDesignerState = {
  openedProjects: createTable<UiOpenedProject>(),
  components: createTable<UiComponent>(),
  plugins: createTable<UiPlugin>(),
  resources: createTable<UiResource>(),
  styles: createTable<UiStyle>(),
  windows: createTable<UiWindow>(),
  templates: createTable<UiTemplate>(),
  controls: createTable<UiControl>(),
  templateInstances: createTable<UiTemplateInstance>(),
};

const DEFAULT_SELECTION: Selection = { type: 'project' };

export default createReducer(initialState, {
  [TabsActionTypes.NEW]: (state, action: PayloadAction<NewTabAction>) => {
    const { id, type, data } = action.payload;
    if (type !== TabType.UI_DESIGNER) {
      return;
    }

    const { projectId } = data as DesignerTabActionData;

    const openedProject: UiOpenedProject = {
      id,
      projectId,
      notifierId: null,
      components: [],
      plugins: [],
      resources: [],
      styles: [],
      windows: [],
      templates: [],
      selection: DEFAULT_SELECTION,
      defaultWindow: { desktop: null, mobile: null },
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

    tableRemove(state.openedProjects, tabId);
  },

  [ActionTypes.SET_NOTIFIER]: (state, action: PayloadAction<ActionPayloads.SetNotifier>) => {
    const { tabId, notifierId } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.notifierId = notifierId;
  },

  [ActionTypes.CLEAR_ALL_NOTIFIERS]: (state, action) => {
    for (const openedProject of Object.values(state.openedProjects.byId)) {
      openedProject.notifierId = null;
      openedProject.components = [];
      openedProject.plugins = [];
      openedProject.resources = [];
      openedProject.styles = [];
      openedProject.windows = [];
      openedProject.templates = [];
      openedProject.selection = DEFAULT_SELECTION;
      openedProject.defaultWindow = { desktop: null, mobile: null };
    }

    tableClear(state.components);
    tableClear(state.plugins);
    tableClear(state.resources);
    tableClear(state.styles);
    tableClear(state.windows);
    tableClear(state.templates);
  },

  [ActionTypes.UPDATE_PROJECT]: (state, action: PayloadAction<ActionPayloads.UpdateProject>) => {
    for (const { tabId, update } of action.payload) {
      const openedProject = state.openedProjects.byId[tabId];
      applyProjectUpdate(state, openedProject, update);
    }
  },

  [ActionTypes.SELECT]: (state, action: PayloadAction<ActionPayloads.Select>) => {
    const { tabId, selection } = action.payload;
    const openedProject = state.openedProjects.byId[tabId];
    openedProject.selection = selection;
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.SET_WINDOW_PROPERTIES]: (state, action: PayloadAction<ActionPayloads.SetWindowProperties>) => {
    const { windowId, properties } = action.payload;
    const window = state.windows.byId[windowId];
    Object.assign(window, properties);
    window.style.sort();
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.SET_TEMPLATE_PROPERTIES]: (state, action: PayloadAction<ActionPayloads.SetTemplateProperties>) => {
    const { templateId, properties } = action.payload;
    const template = state.templates.byId[templateId];
    Object.assign(template, properties);
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.SET_CONTROL_PROPERTIES]: (state, action: PayloadAction<ActionPayloads.SetControlProperties>) => {
    const { controlId, properties } = action.payload;
    const control = state.controls.byId[controlId];
    Object.assign(control, properties);
    control.style.sort();
  },

  // Apply this change right away to improve designer UX, and debounce server update requests
  // Note that server update will apply anyway
  [ActionTypes.MOVE_TEMPLATE_INSTANCE]: (state, action: PayloadAction<ActionPayloads.MoveTemplateInstance>) => {
    const { templateInstanceId, x, y } = action.payload;
    const templateInstance = state.templateInstances.byId[templateInstanceId];

    if (x != null) {
      templateInstance.x = x;
    }

    if (y != null) {
      templateInstance.y = y;
    }
  },
});

function applyProjectUpdate(state: UiDesignerState, openedProject: UiOpenedProject, update: UpdateProjectNotification) {
  switch (update.operation) {
    case 'set-name': {
      const { name } = update as SetNameProjectNotification;
      openedProject.projectId = name;
      break;
    }

    case 'reset': {
      tableRemoveAll(state.components, openedProject.components);
      tableRemoveAll(state.plugins, openedProject.plugins);
      tableRemoveAll(state.resources, openedProject.resources);
      tableRemoveAll(state.styles, openedProject.styles);
      tableRemoveAll(state.windows, openedProject.windows);
      tableRemoveAll(state.templates, openedProject.templates);

      openedProject.components = [];
      openedProject.plugins = [];
      openedProject.resources = [];
      openedProject.styles = [];
      openedProject.windows = [];
      openedProject.templates = [];
      openedProject.selection = DEFAULT_SELECTION;
      openedProject.defaultWindow = { desktop: null, mobile: null };

      break;
    }

    case 'set-ui-component-data': {
      const { components, plugins } = update as SetUiComponentDataNotification;
      updateComponentData(state, openedProject, components, plugins);
      break;
    }

    case 'set-ui-default-window': {
      const { defaultWindow } = update as SetUiDefaultWindowNotification;
      openedProject.defaultWindow = {
        desktop: makeNullableId(openedProject, defaultWindow.desktop),
        mobile: makeNullableId(openedProject, defaultWindow.mobile),
      };
      break;
    }

    case 'set-ui-resource': {
      const { id: resourceId, resource: resourceData } = update as SetUiResourceNotification;

      const resource: UiResource = {
        id: `${openedProject.id}:${resourceId}`,
        resourceId,
        ...resourceData
      };

      tableSet(state.resources, resource, true);
      arraySet(openedProject.resources, resource.id, true);
      break;
    }

    case 'clear-ui-resource': {
      const { id: resourceId } = update as ClearUiResourceNotification;
      const id = `${openedProject.id}:${resourceId}`;
      tableRemove(state.resources, id);
      arrayRemove(openedProject.resources, id);
      break;
    }

    case 'rename-ui-resource': {
      const { id: resourceId, newId: newResourceId } = update as RenameUiResourceNotification;
      const id = `${openedProject.id}:${resourceId}`;
      const newId = `${openedProject.id}:${newResourceId}`;

      const resource = state.resources.byId[id];
      tableRemove(state.resources, id);
      arrayRemove(openedProject.resources, id);

      resource.id = newId;
      resource.resourceId = newResourceId;

      tableSet(state.resources, resource, true);
      arraySet(openedProject.resources, resource.id, true);
      break;
    }

    case 'set-ui-style': {
      const { id: styleId, style: styleData } = update as SetUiStyleNotification;

      const style: UiStyle = {
        id: `${openedProject.id}:${styleId}`,
        styleId,
        ...styleData
      };

      tableSet(state.styles, style, true);
      arraySet(openedProject.styles, style.id, true);
      break;
    }

    case 'clear-ui-style': {
      const { id: styleId } = update as ClearUiStyleNotification;
      const id = `${openedProject.id}:${styleId}`;
      tableRemove(state.styles, id);
      arrayRemove(openedProject.styles, id);
      break;
    }

    case 'rename-ui-style': {
      const { id: styleId, newId: newStyleId } = update as RenameUiStyleNotification;
      const id = `${openedProject.id}:${styleId}`;
      const newId = `${openedProject.id}:${newStyleId}`;

      const style = state.styles.byId[id];
      tableRemove(state.styles, id);
      arrayRemove(openedProject.styles, id);

      style.id = newId;
      style.styleId = newStyleId;

      tableSet(state.styles, style, true);
      arraySet(openedProject.styles, style.id, true);
      break;
    }

    case 'set-ui-window': {
      const { id: windowId, window: windowData } = update as SetUiWindowNotification;

      const id = `${openedProject.id}:${windowId}`;

      const existing = state.windows.byId[id];
      if (existing) {
        tableRemoveAll(state.controls, existing.controls);
        tableRemoveAll(state.templateInstances, existing.templates);
      }

      const controlIds = setViewControls(state, openedProject, 'window', id, windowData.controls);
      const templateInstanceIds = setViewTemplateInstances(state, openedProject, 'window', id, windowData.templates);

      const window: UiWindow = {
        id,
        windowId,
        controls: controlIds,
        templates: templateInstanceIds,
        ...prepareWindowData(openedProject, windowData, { adaptIds: true }),
      };

      tableSet(state.windows, window, true);
      arraySet(openedProject.windows, window.id, true);
      break;
    }

    case 'clear-ui-window': {
      const { id: windowId } = update as ClearUiWindowNotification;
      const id = `${openedProject.id}:${windowId}`;

      const window = state.windows.byId[id];
      tableRemoveAll(state.controls, window.controls);
      tableRemoveAll(state.templateInstances, window.templates);

      tableRemove(state.windows, id);
      arrayRemove(openedProject.windows, id);

      if (openedProject.selection.type === 'window' && openedProject.selection.id === id) {
        openedProject.selection = DEFAULT_SELECTION;
      }

      break;
    }

    case 'rename-ui-window': {
      const { id: windowId, newId: newResourceId } = update as RenameUiWindowNotification;
      const oldId = `${openedProject.id}:${windowId}`;
      const newId = `${openedProject.id}:${newResourceId}`;

      const window = state.windows.byId[oldId];
      tableRemove(state.windows, oldId);
      arrayRemove(openedProject.windows, oldId);

      window.id = newId;
      window.windowId = newResourceId;

      tableSet(state.windows, window, true);
      arraySet(openedProject.windows, window.id, true);

      if (openedProject.selection.type === 'window' && openedProject.selection.id === oldId) {
        openedProject.selection.id = newId;
      }

      renameViewControls(state, 'window', window);
      renameViewTemplateInstances(state, 'window', window);

      break;
    }

    case 'set-ui-template': {
      const { id: templateId, template: templateData } = update as SetUiTemplateNotification;

      const id = `${openedProject.id}:${templateId}`;

      const existing = state.templates.byId[id];
      if (existing) {
        tableRemoveAll(state.controls, existing.controls);
        tableRemoveAll(state.templateInstances, existing.templates);
      }

      const controlIds = setViewControls(state, openedProject, 'template', id, templateData.controls);
      const templateInstanceIds = setViewTemplateInstances(state, openedProject, 'template', id, templateData.templates);

      const template: UiTemplate = {
        id,
        templateId,
        controls: controlIds,
        templates: templateInstanceIds,
        ...prepareTemplateData(templateData),
      };

      tableSet(state.templates, template, true);
      arraySet(openedProject.templates, template.id, true);
      break;
    }

    case 'clear-ui-template': {
      const { id: templateId } = update as ClearUiTemplateNotification;
      const id = `${openedProject.id}:${templateId}`;

      const template = state.templates.byId[id];
      tableRemoveAll(state.controls, template.controls);
      tableRemoveAll(state.templateInstances, template.templates);

      tableRemove(state.templates, id);
      arrayRemove(openedProject.templates, id);

      if (openedProject.selection.type === 'template' && openedProject.selection.id === id) {
        openedProject.selection = DEFAULT_SELECTION;
      }

      break;
    }

    case 'rename-ui-template': {
      const { id: templateId, newId: newResourceId } = update as RenameUiTemplateNotification;
      const oldId = `${openedProject.id}:${templateId}`;
      const newId = `${openedProject.id}:${newResourceId}`;

      const template = state.templates.byId[oldId];
      tableRemove(state.templates, oldId);
      arrayRemove(openedProject.templates, oldId);

      template.id = newId;
      template.templateId = newResourceId;

      tableSet(state.templates, template, true);
      arraySet(openedProject.templates, template.id, true);

      if (openedProject.selection.type === 'template' && openedProject.selection.id === oldId) {
        openedProject.selection.id = newId;
      }

      renameViewControls(state, 'template', template);
      renameViewTemplateInstances(state, 'template', template);

      break;
    }

    default:
      throw new Error(`Unhandled update operation: ${update.operation}`);
  }
}

function updateComponentData(state: UiDesignerState, openedProject: UiOpenedProject, components: { [id: string]: UiComponentData; }, plugins: { [id: string]: UiPluginData; }) {
  tableRemoveAll(state.plugins, openedProject.plugins);
  tableRemoveAll(state.components, openedProject.components);
  openedProject.plugins = [];
  openedProject.components = [];

  for (const [pluginId, data] of Object.entries(plugins)) {
    const id = `${openedProject.id}:${pluginId}`;
    const plugin: UiPlugin = { id, ...data };

    tableSet(state.plugins, plugin, true);
    arrayAdd(openedProject.plugins, plugin.id);
  }

  for (const [componentId, { plugin: pluginId }] of Object.entries(components)) {
    const id = `${openedProject.id}:${componentId}`;
    const plugin = `${openedProject.id}:${pluginId}`;

    const component: UiComponent = {
      id,
      componentId,
      plugin,
    };

    tableSet(state.components, component, true);
    arrayAdd(openedProject.components, component.id);
  }

  openedProject.plugins.sort();
  openedProject.components.sort();
}

function prepareWindowData(openedProject: UiOpenedProject, window: Omit<UiWindow, 'id' | 'windowId' | 'controls' | 'templates'>, { adaptIds }: { adaptIds: boolean; }) {
  const { style, height, width, backgroundResource } = window;

  return {
    height, width,
    style: style.map(id => prepareNullableId(openedProject, id, { adaptIds })),
    backgroundResource: prepareNullableId(openedProject, backgroundResource, { adaptIds })
  };
}

function prepareTemplateData(template: Omit<UiTemplate, 'id' | 'templateId' | 'controls' | 'templates'>) {
  const { height, width, exports } = template;

  return { height, width, exports };
}

function prepareControlData(openedProject: UiOpenedProject, control: Omit<UiControl, 'id' | 'controlId'>, { adaptIds }: { adaptIds: boolean; }) {
  const { style, height, width, x, y, display, text, primaryAction, secondaryAction } = control;

  const controlData = {
    height, width, x, y, display, text, primaryAction, secondaryAction,
    style: style.map(id => prepareNullableId(openedProject, id, { adaptIds })),
  };

  for (const aid of ['primaryAction', 'secondaryAction'] as ('primaryAction' | 'secondaryAction')[]) {
    if (!controlData[aid]) {
      continue;
    }

    if (controlData[aid].window) {
      controlData[aid] = {
        ...controlData[aid],
        window: {
          ...controlData[aid].window,
          id: prepareNullableId(openedProject, controlData[aid].window.id, { adaptIds })
        },
      };
    }

    if (controlData[aid].component) {
      controlData[aid] = {
        ...controlData[aid],
        component: {
          ...controlData[aid].component,
          id: prepareNullableId(openedProject, controlData[aid].component.id, { adaptIds })
        },
      };
    }
  }

  if (controlData.display) {
    controlData.display = {
      ...controlData.display,
      componentId: prepareNullableId(openedProject, controlData.display.componentId, { adaptIds }),
      defaultResource: prepareNullableId(openedProject, controlData.display.defaultResource, { adaptIds }),
      map: controlData.display.map.map(({ resource, ...item }) => ({ ...item, resource: prepareNullableId(openedProject, resource, { adaptIds }) }))
    };
  }

  if (controlData.text) {
    controlData.text = {
      ...controlData.text,
      context: controlData.text.context.map(({ componentId, ...item }) => ({ ...item, componentId: prepareNullableId(openedProject, componentId, { adaptIds }) }))
    };
  }

  return controlData;
}

function prepareTemplateInstanceData(openedProject: UiOpenedProject, templateInstance: Omit<UiTemplateInstance, 'id' | 'templateInstanceId'>, { adaptIds }: { adaptIds: boolean; }) {
  const { x, y, templateId, bindings } = templateInstance;

  const newBindings: { [name: string]: UiTemplateInstanceBinding; } = {};

  for (const [exportId, { componentId, ...bindingData }] of Object.entries(bindings)) {
    newBindings[exportId] = {
      ...bindingData,
      componentId: prepareNullableId(openedProject, componentId, { adaptIds }),
    };
  }

  return {
    templateId: prepareNullableId(openedProject, templateId, { adaptIds }),
    x, y,
    bindings: newBindings
  };
}

function prepareNullableId(openedProject: UiOpenedProject, id: string, { adaptIds }: { adaptIds: boolean; }) {
  return adaptIds ? makeNullableId(openedProject, id) : id;
}

function makeNullableId(openedProject: UiOpenedProject, id: string) {
  return id ? `${openedProject.id}:${id}` : id;
}

function setViewControls(state: UiDesignerState, openedProject: UiOpenedProject, viewType: UiViewType, viewId: string, controls: { [id: string]: UiControlData; }) {
  return Object.entries(controls).map(([controlId, controlData]) => {
    const control: UiControl = {
      id: `${viewId}:${viewType}:${controlId}`,
      controlId,
      ...prepareControlData(openedProject, controlData, { adaptIds: true })
    };

    tableSet(state.controls, control, true);

    return control.id;
  });
}

function renameViewControls(state: UiDesignerState, viewType: UiViewType, view: UiView) {
  for (const [index, oldId] of view.controls.entries()) {
    const control = state.controls.byId[oldId];

    tableRemove(state.controls, oldId);
    const newId = control.id = `${view.id}:${viewType}:${control.controlId}`;
    tableSet(state.controls, control, true);

    view.controls[index] = newId;
  }
}

function setViewTemplateInstances(state: UiDesignerState, openedProject: UiOpenedProject, viewType: UiViewType, viewId: string, templates: { [id: string]: UiTemplateInstanceData; }) {
  return Object.entries(templates).map(([templateInstanceId, templateInstanceData]) => {
    const templateInstance: UiTemplateInstance = {
      id: `${viewId}:${viewType}:${templateInstanceId}`,
      templateInstanceId,
      ...prepareTemplateInstanceData(openedProject, templateInstanceData, { adaptIds: true })
    };

    tableSet(state.templateInstances, templateInstance, true);

    return templateInstance.id;
  });
}

function renameViewTemplateInstances(state: UiDesignerState, viewType: UiViewType, view: UiView) {
  for (const [index, oldId] of view.templates.entries()) {
    const templateInstance = state.templateInstances.byId[oldId];

    tableRemove(state.templateInstances, oldId);
    const newId = templateInstance.id = `${view.id}:${viewType}:${templateInstance.templateInstanceId}`;
    tableSet(state.templateInstances, templateInstance, true);

    view.templates[index] = newId;
  }
}