export const enum StoreItemType {
  COMPONENT = 'component',
  BINDING = 'binding'
}

export interface StoreItem {
  readonly type: StoreItemType;
  readonly config: any;
}

export interface StoreOperations {
  load(): Promise<StoreItem[]>;
  save(items: StoreItem[]): Promise<void>;
}