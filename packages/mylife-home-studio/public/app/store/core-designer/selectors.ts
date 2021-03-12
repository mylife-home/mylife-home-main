import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { CoreOpenedProject, MemberType } from './types';

const getOpenedProjects = (state: AppState) => state.coreDesigner.openedProjects;

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

export const getInstanceIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).instances.allIds;
export const getInstance = (state: AppState, tabId: string, instanceId: string) => getOpenedProject(state, tabId).instances.byId[instanceId];
export const getPluginIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).plugins.allIds;
export const getPlugin = (state: AppState, tabId: string, pluginId: string) => getOpenedProject(state, tabId).plugins.byId[pluginId];
export const getComponentIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).components.allIds;
export const getComponent = (state: AppState, tabId: string, componentId: string) => getOpenedProject(state, tabId).components.byId[componentId];
export const getBindingIds = (state: AppState, tabId: string) => getOpenedProject(state, tabId).bindings.allIds;
export const getBinding = (state: AppState, tabId: string, bindingId: string) => getOpenedProject(state, tabId).bindings.byId[bindingId];

export const getInstanceStats = (state: AppState, tabId: string, instanceId: string) => {
  const project = getOpenedProject(state, tabId);
  const instance = getInstance(state, tabId, instanceId);

  const stats = {
    plugins: 0,
    components: 0,
    externalComponents: 0,
  };

  for (const pluginId of instance.plugins) {
    ++stats.plugins;
    computePluginStats(project, pluginId, stats);
  }

  return stats;
};

export const getPluginStats = (state: AppState, tabId: string, pluginId: string) => {
  const project = getOpenedProject(state, tabId);

  const stats = {
    components: 0,
    externalComponents: 0,
  };

  computePluginStats(project, pluginId, stats);

  return stats;
};

function computePluginStats(project: CoreOpenedProject, pluginId: string, stats: { components: number; externalComponents: number; }) {
  const plugin = project.plugins.byId[pluginId];

  for (const componentId of plugin.components) {
    const component = project.components.byId[componentId];

    if (component.external) {
      ++stats.externalComponents;
    } else {
      ++stats.components;
    }
  }
}

export const getNewBindingHalfList = (state: AppState, tabId: string, componentId: string, memberName: string) => {
  const project = getOpenedProject(state, tabId);
  const component = project.components.byId[componentId];
  const plugin = project.plugins.byId[component.plugin];
  const member = plugin.members[memberName];

  const possiblePluginMembers = buildPossibleMembers(project, getBindingOtherHalfType(member.memberType), member.valueType);

  const list: { componentId: string; memberName: string; }[] = [];

  // select all action/state with same type, and for which no binding already exist
  for (const possibleComponent of Object.values(project.components.byId)) {
    // for now avoid binding on self
    if (possibleComponent.id === component.id) {
      continue;
    }

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

      list.push({ componentId: possibleComponent.id, memberName: possibleMember });
    }
  }

  return list;
};

function buildPossibleMembers(project: CoreOpenedProject, memberType: MemberType, valueType: string) {
  const possiblePluginMembers = new Map<string, Set<string>>();

  for (const plugin of Object.values(project.plugins.byId)) {
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