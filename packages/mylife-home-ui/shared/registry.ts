export interface ComponentStates {
  [id: string]: any;
}

export interface Reset {
  [id: string]: ComponentStates;
}

export interface ComponentAdd {
  readonly id: string;
  readonly attributes: ComponentStates;
}

export interface ComponentRemove {
  readonly id: string;
}

export interface StateChange {
  readonly id: string;
  readonly name: string;
  readonly value: string;
}