export type ById<T> = { [id: string]: T; };

export interface Table<T> {
  byId: ById<T>;
  allIds: string[];
}