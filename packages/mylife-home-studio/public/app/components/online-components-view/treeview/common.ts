import { createContext } from 'react';
import { NodeType } from '../types';

export type Type = 'instances-plugins-components' | 'instances-components' | 'plugins-components' | 'components';

export function makeNodeId(type: NodeType, id: string) {
  return `${type}$${id}`;
}

export interface Config {
  root: 'instances' | 'plugins' | 'components';

  instance: {
    components: boolean;
    plugins: boolean;
  };

  plugin: {
    components: boolean;
  };

  component: {
    plugin: boolean;
    states: boolean;
  };
}

export const ConfigContext = createContext<Config>(null);

export type NodeRepository = Map<string, { type: NodeType; id: string }>;

export const NodeRepositoryContext = createContext<NodeRepository>(null);
