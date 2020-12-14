import { Window, DefaultWindow } from '../../shared/model';

export interface Definition {
  readonly resources: DefinitionResource[];
  readonly windows: Window[];
  readonly defaultWindow: DefaultWindow;
}

export interface DefinitionResource {
  readonly id: string;
  readonly mime: string;
  readonly data: string;
}
