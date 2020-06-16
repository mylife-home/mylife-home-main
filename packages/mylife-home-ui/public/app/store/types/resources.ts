import { Map } from 'immutable';

export const RESOURCE_QUERY = 'resource/query';
export const RESOURCE_GET = 'resource/get';

export type Content = any;
export type ResourceCallback = (err: Error, content: Content) => void;

export interface ResourceQuery {
  readonly resource: string;
  readonly done: ResourceCallback;
}

export interface ResourceGet extends ResourceQuery {
  readonly content: Content;
}

export type ResourcesState = Map<string, Content>;
