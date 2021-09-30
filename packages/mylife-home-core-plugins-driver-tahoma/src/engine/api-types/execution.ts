export interface Execution {
  readonly label?: string;
  readonly metadata?: string;
  readonly actions: Action[];
}

export interface Action {
  readonly deviceURL: string;
  readonly commands: Command[];
}

export interface Command {
  readonly name: string;
  readonly parameters?: any[];
}
