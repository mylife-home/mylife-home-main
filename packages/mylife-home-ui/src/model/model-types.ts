export * from '../../shared/model';
import { Window } from '../../shared/model';

export interface Model {
  windows: Window[];
  defaultWindow: { [type: string]: string; };
}
