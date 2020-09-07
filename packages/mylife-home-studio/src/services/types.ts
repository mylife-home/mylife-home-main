export interface Service {
  init(): Promise<void>;
  terminate(): Promise<void>;
}