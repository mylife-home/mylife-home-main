export const REGISTRY_RESET = 'registry/reset';
export const REGISTRY_COMPONENT_ADD = 'registry/component-add';
export const REGISTRY_COMPONENT_REMOVE = 'registry/component-remove';
export const REGISTRY_ATTRIBUTE_CHANGE = 'registry/attribute-change';

export type AttributesState = { [id: string]: any };
export type RepositoryState = { [id: string]: AttributesState };
