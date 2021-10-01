export interface Device {
  readonly creationTime: number;
  readonly lastUpdateTime: number;
  readonly label: string;
  readonly deviceURL: string;
  readonly shortcut: boolean;
  readonly controllableName: string;
  readonly definition: Definition;
  readonly states: Entry[];
  readonly attributes: Entry[];
  readonly available: boolean;
  readonly enabled: boolean;
  readonly placeOID: string;
  readonly widget: string;
  readonly type: number;
  readonly oid: string;
  readonly uiClass: string;
}

export interface Entry {
  readonly name: string;
  readonly type: number; // 1 = null? (always 0), 2 = integer or number (if decimal it's in a string), 3 = string, 6 = boolean
  readonly value: any;
}

export interface Definition {
  readonly type: string;
  readonly qualifiedName: string;
  readonly uiClass: string;
  readonly uiClassifiers?: string[];
  readonly widgetName: string;
  readonly dataProperties: DataPropertyDefinition[];
  readonly states: StateDefinition[];
  readonly commands: CommandDefinition[];
}

export interface DataPropertyDefinition {
  readonly qualifiedName: string;
  readonly value: string;
}

export interface StateDefinition {
  readonly qualifiedName: string;
  readonly type: string;
  readonly values?: string[];
}

export interface CommandDefinition {
  readonly commandName: string;
  readonly nparams: number;
}
