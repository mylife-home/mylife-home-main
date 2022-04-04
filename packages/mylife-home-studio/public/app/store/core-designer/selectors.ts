import { createSelector } from '@reduxjs/toolkit';
import { AppState } from '../types';
import { ById } from '../common/types';
import { Member, MemberType, ConfigItem, ComponentsSelection, BindingSelection, View, Template, ComponentDefinition, Plugin, TemplateMemberExport, TemplateConfigExport, ComponentDefinitionProperties, ComponentDefinitionStats, InstanceStats, Component, ComponentDefinitionType } from './types';

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

  const stats: InstanceStats = {
    use: 'unused',
    plugins: 0,
    components: 0,
    externalComponents: 0,
    hasHidden: false,
    hasShown: false,
  };

  for (const pluginId of instance.plugins) {
    ++stats.plugins;
    
    const { components, externalComponents } = getPluginStats(state, pluginId);
    stats.components += components;
    stats.externalComponents += externalComponents;

    const plugin = getPlugin(state, pluginId);

    switch (plugin.toolboxDisplay) {
      case 'show':
        stats.hasShown = true;
        break;

      case 'hide':
        stats.hasHidden = true;
        break;
    }
  }

  updateUse(stats);

  return stats;
};

export const getPluginStats = (state: AppState, pluginId: string) => {
  const plugin = getPlugin(state, pluginId);
  return getComponentDefinitionStats(state, plugin.usageComponents);
}

export const getTemplateStats = (state: AppState, templateId: string) => {
  const template = getTemplate(state, templateId);
  return getComponentDefinitionStats(state, template.usageComponents);
}

function getComponentDefinitionStats(state: AppState, usageComponents: string[]) {
  const stats: ComponentDefinitionStats = {
    use: 'unused',
    components: 0,
    externalComponents: 0,
  };

  for (const componentId of usageComponents) {
    const component = getComponent(state, componentId);

    if (component.external) {
      ++stats.externalComponents;
    } else {
      ++stats.components;
    }
  }

  updateUse(stats);

  return stats;
};

function updateUse(stats: ComponentDefinitionStats) {
  if (stats.components > 0) {
    stats.use = 'used';
  } else if (stats.externalComponents > 0) {
    stats.use = 'external';
  } else {
    stats.use = 'unused';
  }
}

export interface BindingHalf {
  componentId: string;
  componentName: string;
  memberName: string;
}

export const getNewBindingHalfList = (state: AppState, tabId: string, componentId: string, memberName: string) => {
  const component = getComponent(state, componentId);
  const definition = getComponentDefinitionProperties(component.definition, buildComponentDefinitionResolverMaps(state));
  const member = definition.members[memberName];

  const possiblePluginMembers = buildPossibleMembers(state, tabId, getBindingOtherHalfType(member.memberType), member.valueType);

  const list: BindingHalf[] = [];

  // select all action/state with same type, and for which no binding already exist
  for (const possibleComponentId of getComponentIds(state, tabId)) {
    // for now avoid binding on self
    if (possibleComponentId === component.id) {
      continue;
    }

    const possibleComponent = getComponent(state, possibleComponentId);
    const defId = makeDefId(possibleComponent.definition);
    const possiblePlugin = possiblePluginMembers.get(defId);
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

function makeDefId(definition: ComponentDefinition) {
  return `${definition.type}:${definition.id}`;
}

function buildPossibleMembers(state: AppState, tabId: string, memberType: MemberType, valueType: string) {
  const possibleDefinitionMembers = new Map<string, Set<string>>();

  const maps = buildComponentDefinitionResolverMaps(state);

  const definitions: ComponentDefinition[] = [
    ...getPluginIds(state, tabId).map(id => ({ type: 'plugin' as ComponentDefinitionType, id })),
    ...getTemplateIds(state, tabId).map(id => ({ type: 'template' as ComponentDefinitionType, id })),
  ];
  

  for (const defRef of definitions) {
    const definition = getComponentDefinitionProperties(defRef, maps);
    for (const [memberName, member] of Object.entries(definition.members)) {
      if (member.memberType !== memberType || member.valueType !== valueType) {
        continue;
      }

      const defId = makeDefId(defRef);

      let possibleDefinition = possibleDefinitionMembers.get(defId);
      if (!possibleDefinition) {
        possibleDefinition = new Set<string>();
        possibleDefinitionMembers.set(defId, possibleDefinition);
      }

      possibleDefinition.add(memberName);
    }
  }

  return possibleDefinitionMembers;
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

export const getActiveTemplate = (state: AppState, tabId: string) => {
  const templateId = getActiveTemplateId(state, tabId);
  return getTemplate(state, templateId);
};

export function makeGetExportedComponentIds() {
  return createSelector(
    getActiveTemplate,
    (template: Template) => {
      const ids: string[] = [];
      
      if (template) {
        for (const configExport of Object.values(template.exports.config)) {
          ids.push(configExport.component);
        }
    
        for (const memberExport of Object.values(template.exports.members)) {
          ids.push(memberExport.component);
        }
      }
  
      return ids;
    }
  );
}

interface ComponentDefinitionResolverMaps {
  components: ById<Component>;
  plugins: ById<Plugin>;
  templates: ById<Template>;
}

function buildComponentDefinitionResolverMaps(state: AppState) {
  const maps: ComponentDefinitionResolverMaps = {
    templates: getTemplatesMap(state),
    components: getComponentsMap(state),
    plugins: getPluginsMap(state),
  };

  return maps;
}

function getComponentDefinitionProperties(definition: ComponentDefinition, maps: ComponentDefinitionResolverMaps) {
  const properties: ComponentDefinitionProperties = {
    stateIds: [],
    actionIds: [],
    configIds: [],
    members: {},
    config: {}
  };

  switch(definition.type) {
    case 'plugin': {
      const plugin = maps.plugins[definition.id];

      const { members, config } = plugin;
      Object.assign(properties, { members, config });

      break;
    }

    case 'template': {
      const template = maps.templates[definition.id];

      for (const [id, configExport] of Object.entries(template.exports.config)) {
        properties.config[id] = resolveTemplateConfigItem(maps, configExport);
      }

      for (const [id, memberExport] of Object.entries(template.exports.members)) {
        properties.members[id] = resolveTemplateMember(maps, memberExport);
      }

      break;
    }
  }

  for (const [name, { memberType }] of Object.entries(properties.members)) {
    switch (memberType) {
      case MemberType.STATE:
        properties.stateIds.push(name);
        break;
      case MemberType.ACTION:
        properties.actionIds.push(name);
        break;
    }
  }

  for (const name of Object.keys(properties.config)) {
    properties.configIds.push(name);
  }

  properties.stateIds.sort();
  properties.actionIds.sort();
  properties.configIds.sort();

  return properties;
}

function resolveTemplateConfigItem(maps: ComponentDefinitionResolverMaps, configExport: TemplateConfigExport): ConfigItem {
  const { definition } = maps.components[configExport.component];
  switch (definition.type) {
    case 'plugin': {
      const plugin = maps.plugins[definition.id];
      return plugin.config[configExport.configName];
    }

    case 'template': {
      const template = maps.templates[definition.id];
      return resolveTemplateConfigItem(maps, template.exports.config[configExport.configName]);
    }
  }
}

function resolveTemplateMember(maps: ComponentDefinitionResolverMaps, memberExport: TemplateMemberExport): Member {
  const { definition } = maps.components[memberExport.component];
  switch (definition.type) {
    case 'plugin': {
      const plugin = maps.plugins[definition.id];
      return plugin.members[memberExport.member];
    }

    case 'template': {
      const template = maps.templates[definition.id];
      return resolveTemplateMember(maps, template.exports.members[memberExport.member]);
    }
  }
}

export function makeGetComponentDefinitionProperties() {
  return createSelector(
    (state: AppState, definition: ComponentDefinition) => definition.id, // make it stable
    (state: AppState, definition: ComponentDefinition) => definition.type,
    getTemplatesMap,
    getComponentsMap,
    getPluginsMap,
    (id, type, templates, components, plugins) => getComponentDefinitionProperties({ id, type }, { templates, components, plugins })
  );
};

/**
 * Create a getter, which lifecycle is based on state change
 */
export const getComponentDefinitionPropertiesGetter = createSelector(
  getTemplatesMap,
  getComponentsMap,
  getPluginsMap,
  (templates, components, plugins) => (definition: ComponentDefinition) => getComponentDefinitionProperties(definition, { templates, components, plugins })
);

export interface PropertyItem {
  componentId: string;
  componentName: string;
  propertyName: string;
}

export const getTemplateCandidateMemberExports = (state: AppState, templateId: string) => {
  const maps = buildComponentDefinitionResolverMaps(state);
  const template = getTemplate(state, templateId);
  
  const list: PropertyItem[] = [];

  for (const componentId of template.components) {
    const component = maps.components[componentId];
    const properties = getComponentDefinitionProperties(component.definition, maps);

    for (const memberId of [...properties.stateIds, ...properties.actionIds]) {
      list.push({
        componentId: component.id,
        componentName: component.componentId,
        propertyName: memberId
      });
    }
  }

  return list;
};

export const getTemplateCandidateConfigExports = (state: AppState, templateId: string) => {
  const maps = buildComponentDefinitionResolverMaps(state);
  const template = getTemplate(state, templateId);
  
  const list: PropertyItem[] = [];

  const existings = new Set<string>();
  for (const item of Object.values(template.exports.config)) {
    existings.add(`${item.component}:${item.configName}`);
  }

  for (const componentId of template.components) {
    const component = maps.components[componentId];
    const properties = getComponentDefinitionProperties(component.definition, maps);

    for (const configId of properties.configIds) {
      // Do not allow to export a config twice
      const candidate  =`${component.id}:${configId}`;
      if (existings.has(candidate)) {
        continue;
      }

      list.push({
        componentId: component.id,
        componentName: component.componentId,
        propertyName: configId
      });
    }
  }

  return list;
};

export const getTemplateConfigItem = (state: AppState, templateId: string, configId: string) => {
  const maps = buildComponentDefinitionResolverMaps(state);
  const template = getTemplate(state, templateId);

  const configExport = template.exports.config[configId];
  return resolveTemplateConfigItem(maps, configExport);
}

export const getTemplateMemberItem = (state: AppState, templateId: string, memberId: string) => {
  const maps = buildComponentDefinitionResolverMaps(state);
  const template = getTemplate(state, templateId);

  const memberExport = template.exports.members[memberId];
  return resolveTemplateMember(maps, memberExport);
}

export const getUsableTemplates = (state: AppState, tabId: string) => {
  const activeTemplate = getActiveTemplateId(state, tabId);
  const usage = new Set<string>();
  if (activeTemplate) {
    fillTemplateUsage(state, activeTemplate, usage);
  }

  return getTemplateIds(state, tabId).filter(id => !usage.has(id));
}

function fillTemplateUsage(state: AppState, templateId: string, usage: Set<string>) {
  if (usage.has(templateId)) {
    return;
  }

  usage.add(templateId);

  const template = getTemplate(state, templateId);

  for (const componentId of template.usageComponents) {
    const component = getComponent(state, componentId);
    if (component.templateId) {
      fillTemplateUsage(state, component.templateId, usage);
    }
  }
}