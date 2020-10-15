export type NodeType = 'instance' | 'plugin' | 'component' | 'state';

export interface Selection {
  type: NodeType;
  id: string;
}