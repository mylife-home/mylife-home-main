export const RESOURCE_QUERY = 'resource/query';

export type Content = any;
export type ResourceCallback = (err: Error, content?: Content) => void;

export interface ResourceQuery {
  readonly resource: string;
  readonly done: ResourceCallback;
}
