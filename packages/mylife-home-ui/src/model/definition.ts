import { Window } from '../../shared/model';

export interface Definition {
  readonly resources: DefinitionResource[];
  readonly windows: Window[];
  readonly defaultWindow: { [type: string]: string; };
}

export interface DefinitionResource {
  readonly id: string;
  readonly mime: string;
  readonly data: string;
}
