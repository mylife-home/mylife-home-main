import { Table } from './types';

export interface ItemWithId {
  readonly id: string;
}

export function createTable<T extends ItemWithId>(iterable?: Iterable<T>): Table<T> {
  const table: Table<T> = {
    byId: {},
    allIds: [],
  };

  if (iterable) {
    for (const item of iterable) {
      const { id } = item;
      table.byId[id] = item;
      table.allIds.push(id);
    }
  }

  return table;
}

