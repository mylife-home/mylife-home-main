import { StoreItem } from './model';

export interface StoreOperations {
  load(): Promise<StoreItem[]>;
  save(items: StoreItem[]): Promise<void>;
}

export interface StoreConfiguration {
  readonly type: string;
}
