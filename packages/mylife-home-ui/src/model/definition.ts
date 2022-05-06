import { Window, DefaultWindow } from '../../shared/model';

export interface Definition {
  readonly resources: DefinitionResource[];
  readonly styles: DefinitionStyle[];
  readonly windows: Window[];
  readonly defaultWindow: DefaultWindow;
}

export interface DefinitionResource {
  readonly id: string;
  readonly mime: string;
  readonly data: string;
}

export interface DefinitionStyle {
  readonly id: string;
  readonly properties: object;
}