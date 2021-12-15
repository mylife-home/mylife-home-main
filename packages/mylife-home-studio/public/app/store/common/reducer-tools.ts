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

export function tableSet<T extends ItemWithId>(table: Table<T>, item: T, sortById = false) {
  const { id } = item;

  if (!table.byId[id]) {
    arrayAdd(table.allIds, id, sortById);
  }

  table.byId[id] = item;
}

export function tableAdd<T extends ItemWithId>(table: Table<T>, item: T, sortById = false) {
  const { id } = item;
  if (table.byId[id]) {
    return;
  }

  table.byId[id] = item;
  arrayAdd(table.allIds, id, sortById);
}

export function tableRemove<T extends ItemWithId>(table: Table<T>, id: string) {
  if (!table.byId[id]) {
    return;
  }

  delete table.byId[id];
  arrayRemove(table.allIds, id);
}

export function arrayAdd(array: string[], id: string, sortById = false) {
  array.push(id);

  if (sortById) {
    array.sort();
  }
}

export function arrayRemove(array: string[], id: string) {
  // could use binary search ?
  const index = array.indexOf(id);
  array.splice(index, 1);
}

export function arraySet(array: string[], id: string, sortById = false) {
  if (!array.includes(id)) {
    arrayAdd(array, id, sortById);
  }
}