export const RESOURCE_QUERY = 'resource/query';

export interface ResourceQuery {
  readonly resource: string;
  readonly onContent: (content: any) => void;
}
