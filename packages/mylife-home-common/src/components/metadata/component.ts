
export interface Component {
  readonly id: string;
  readonly plugin: string; // `${plugin.module}.${plugin.name}`
}