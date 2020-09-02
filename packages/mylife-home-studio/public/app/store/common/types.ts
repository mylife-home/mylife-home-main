export interface Table<T> {
  byId: { [id: string]: T; };
  allIds: string[];
}