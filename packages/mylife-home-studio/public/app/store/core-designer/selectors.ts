import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { MemberType, ComponentsSelection, BindingSelection, View } from './types';

const getCoreDesigner = (state: AppState) => state.coreDesigner;
const getOpenedProjects = (state: AppState) => getCoreDesigner(state).openedProjects;
const getInstancesTable = (state: AppState) => getCoreDesigner(state).instances;
const getPluginsTable = (state: AppState) => getCoreDesigner(state).plugins;
const getTemplatesTable = (state: AppState) => getCoreDesigner(state).templates;
const getComponentsTable = (state: AppState) => getCoreDesigner(state).components;
const getBindingsTable = (state: AppState) => getCoreDesigner(state).bindings;

export const hasOpenedProjects = (state: AppState) => getOpenedProjects(state).allIds.length > 0;
export const getOpenedProject = (state: AppState, tabId: string) => getOpenedProjects(state).byId[tabId];

export const getOpenedProjectsIdAndProjectIdList = (state: AppState) => {
  const openedProjects = getOpenedProjects(state);
  return Object.values(openedProjects.byId).map(({ id, projectId }) => ({ id, projectId }));
};

const projectIdByNotifierIdMap = createSelector(
  getOpenedProjects,
  (projects) => {
    const map = new Map<string, string>();
    for (const project of Object.values(projects.byId)) {
      map.set(project.notifierId, project.id);
    }
    return map;
  },
);

export const getOpenedProjectIdByNotifierId = (state: AppState, notifierId: string) => {
  const map = projectIdByNotifierIdMap(state);
  return map.get(notifierId);
};

export const getActiveTemplateId = (state: AppState, tabId: string) => getOpenedProject(state, tabId).activeTemplate;

const getView = (state: AppState, tabId: string, templateId: string): View => {
  return templateId ? getTemplate(state, templateId) : getOpenedProject(state, tabId);
}

const getActiveView = (state: AppState, tabId: string): View => {
  const activeTemplate = getActiveTemplateId(state, tabId);
  return getView(state, tabId, activeTemplate);
};

export const getInstanceIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).instances;
export const getInstance = (state: AppState, instanceId: string) => getInstancesTable(state).byId[instanceId];
export const getPluginIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).plugins;
export const getPlugin = (state: AppState, pluginId: string) => getPluginsTable(state).byId[pluginId];
export const getTemplateIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).templates;
export const getTemplate = (state: AppState, templateId: string) => getTemplatesTable(state).byId[templateId];
export const getComponentIds = (state: AppState, tabId: string) => getActiveView(state, tabId).components;
export const getComponent = (state: AppState, componentId: string) => getComponentsTable(state).byId[componentId];
export const getBindingIds = (state: AppState, tabId: string) => getActiveView(state, tabId).bindings;
export const getBinding = (state: AppState, bindingId: string) => getBindingsTable(state).byId[bindingId];

export const getTemplatesMap = (state: AppState) => getTemplatesTable(state).byId;
export const getComponentsMap = (state: AppState) => getComponentsTable(state).byId;
export const getPluginsMap = (state: AppState) => getPluginsTable(state).byId;

export const getInstanceStats = (state: AppState, instanceId: string) => {
  const instance = getInstance(state, instanceId);

  const stats = {
    plugins: 0,
    components: 0,
    externalComponents: 0,
  };

  for (const pluginId of instance.plugins) {
    ++stats.plugins;
    computePluginStats(state, pluginId, stats);
  }

  return stats;
};

export const getPluginStats = (state: AppState, pluginId: string) => {
  const stats = {
    components: 0,
    externalComponents: 0,
  };

  computePluginStats(state, pluginId, stats);

  return stats;
};

function computePluginStats(state: AppState, pluginId: string, stats: { components: number; externalComponents: number; }) {
  const plugin = getPlugin(state, pluginId);

  for (const componentId of plugin.components) {
    const component = getComponent(state, componentId);

    if (component.external) {
      ++stats.externalComponents;
    } else {
      ++stats.components;
    }
  }
}

export interface BindingHalf {
  componentId: string;
  componentName: string;
  memberName: string;
}

export const getNewBindingHalfList = (state: AppState, tabId: string, componentId: string, memberName: string) => {
  const component = getComponent(state, componentId);
  const plugin = getPlugin(state, component.plugin);
  const member = plugin.members[memberName];

  const possiblePluginMembers = buildPossibleMembers(state, tabId, getBindingOtherHalfType(member.memberType), member.valueType);

  const list: BindingHalf[] = [];

  // select all action/state with same type, and for which no binding already exist
  for (const possibleComponentId of getComponentIds(state, tabId)) {
    // for now avoid binding on self
    if (possibleComponentId === component.id) {
      continue;
    }

    const possibleComponent = getComponent(state, possibleComponentId);
    const possiblePlugin = possiblePluginMembers.get(possibleComponent.plugin);
    if (!possiblePlugin) {
      continue;
    }

    for (const possibleMember of possiblePlugin) {
      const bindingId = makeBindingId(member.memberType, component.id, memberName, possibleComponent.id, possibleMember);
      if (component.bindings[memberName]?.includes(bindingId)) {
        // binding already exists
        continue;
      }

      list.push({
        componentId: possibleComponent.id,
        componentName: possibleComponent.componentId,
        memberName: possibleMember
      });
    }
  }

  return list;
};

function buildPossibleMembers(state: AppState, tabId: string, memberType: MemberType, valueType: string) {
  const possiblePluginMembers = new Map<string, Set<string>>();

  for (const pluginId of getPluginIds(state, tabId)) {
    const plugin = getPlugin(state, pluginId);
    for (const [memberName, member] of Object.entries(plugin.members)) {
      if (member.memberType !== memberType || member.valueType !== valueType) {
        continue;
      }

      let possiblePlugin = possiblePluginMembers.get(plugin.id);
      if (!possiblePlugin) {
        possiblePlugin = new Set<string>();
        possiblePluginMembers.set(plugin.id, possiblePlugin);
      }

      possiblePlugin.add(memberName);
    }
  }

  return possiblePluginMembers;
}

function getBindingOtherHalfType(memberType: MemberType) {
  switch (memberType) {
    case MemberType.ACTION:
      return MemberType.STATE;
    case MemberType.STATE:
      return MemberType.ACTION;
    default:
      throw new Error(`Unhandled MemberType: '${memberType}'`);
  }
}

function makeBindingId(memberType: MemberType, componentId: string, memberName: string, otherComponentId: string, otherMemberName: string) {
  switch (memberType) {
    case MemberType.ACTION:
      return `${otherComponentId}:${otherMemberName}:${componentId}:${memberName}`;
    case MemberType.STATE:
      return `${componentId}:${memberName}:${otherComponentId}:${otherMemberName}`;
    default:
      throw new Error(`Unhandled MemberType: '${memberType}'`);
  }
}

export const getActiveTemplate = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.activeTemplate;
};

export const getSelection = (state: AppState, tabId: string) => {
  const project = getOpenedProject(state, tabId);
  return project.viewSelection;
};

export const getSelectionType = (state: AppState, tabId: string) => {
  const selection = getSelection(state, tabId);

  switch (selection?.type) {
    case 'binding':
      return 'binding';
    case 'components':
      return Object.keys((selection as ComponentsSelection).ids).length > 1 ? 'components' : 'component';
    default:
      return null;
  }
};

const EMPTY_SELECTION = {};

export const getSelectedComponents = (state: AppState, tabId: string) => {
  const selection = getSelection(state, tabId);
  return selection?.type === 'components' ? (selection as ComponentsSelection).ids : EMPTY_SELECTION;
};

export const getSelectedComponentsArray = createSelector(
  getSelectedComponents,
  (components) => Object.keys(components).sort(),
);

export const getSelectedComponent = (state: AppState, tabId: string) => {
  const ids = getSelectedComponentsArray(state, tabId);
  return ids.length > 0 ? ids[0] : null;
};

export const isComponentSelected = (state: AppState, tabId: string, componentId: string) => {
  const ids = getSelectedComponents(state, tabId);
  return !!(ids as { [key: string]: boolean })[componentId];
};

export const getSelectedBinding = (state: AppState, tabId: string) => {
  const selection = getSelection(state, tabId);
  return selection?.type === 'binding' ? (selection as BindingSelection).id : null;
};

export const isBindingSelected = (state: AppState, tabId: string, bindingId: string) => {
  return getSelectedBinding(state, tabId) === bindingId;
};